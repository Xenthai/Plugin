<#
.SYNOPSIS
    Installs the Xenth AI plugin into Claude Cowork, Claude Code, or both, retrying the two steps
    that fail for reasons that have nothing to do with the plugin.

.DESCRIPTION
    Three facts about installing this plugin on Windows, none of them visible from the app:

    1. Cowork and Claude Code keep SEPARATE stores. Cowork's lives under ~/.claude/cowork_plugins
       and is reached by passing --cowork to the CLI; Claude Code's lives under ~/.claude/plugins.
       Installing into one leaves the other empty, and the app gives no hint that a second store
       exists. --cowork is a real flag but is not listed in any --help output.

    2. `marketplace add` and `install` fail intermittently with
       `EPERM: operation not permitted, rename ...`
       on machines with Windows Defender real-time protection and behaviour monitoring enabled.
       Defender holds a handle on the files the CLI has just written at the moment the CLI renames
       the directory into place. It is not a permissions problem, not a repository problem, and not
       fixable by running as administrator. The same command, unchanged, succeeds on a later
       attempt: observed failing twice then succeeding on the third for the marketplace, and five
       times then succeeding on the sixth for the install. Retrying is the fix.

    3. The plugin's one runtime dependency is never installed. `package.json` assumes the CLI runs
       `npm install` when it copies a plugin into its cache. It does not. `node_modules` is
       gitignored, so the marketplace clone carries none either, and `render.mjs` imports
       `playwright-core` at its top level — so every render fails on a fresh install until the
       dependency is present. `hooks/bootstrap.mjs` now installs it at session start; this script
       does it too, so an install is complete before anybody opens a session.

    The marketplace is added ONLY when it is absent. `marketplace add` overwrites the declaration in
    user settings, and on a client's machine the declaration is the app's to own — so this script
    reads the store first and skips the add when the catalogue is already there, rather than
    clobbering it and reporting success.

.PARAMETER Store
    cowork, code, or both. Defaults to both.

.PARAMETER Source
    The marketplace to add. Defaults to the published repo. Pass a local path to install from a
    working copy instead — useful while developing, since it skips the clone entirely and with it
    the whole class of EPERM failure.

.PARAMETER Attempts
    How many times to retry each step before giving up. Defaults to 10.

.EXAMPLE
    .\install.ps1
    Installs into both stores from the published repo.

.EXAMPLE
    .\install.ps1 -Store cowork -Source "C:\Archivos de proyecto\GitHub\XenthAI\Plugin"
    Installs into Cowork from a local working copy.
#>
[CmdletBinding()]
param(
    [ValidateSet('cowork', 'code', 'both')]
    [string]$Store = 'both',

    [string]$Source = 'Xenthai/Plugin',

    [ValidateRange(1, 50)]
    [int]$Attempts = 10
)

$ErrorActionPreference = 'Continue'

$MarketplaceName = 'xenthai'
$PluginName      = 'xenthai'
$PluginId        = "$PluginName@$MarketplaceName"

# The two stores, and the flag that selects each. Cowork's flag is undocumented; Claude Code's
# store is the CLI default and takes no flag at all.
$Stores = @{
    cowork = @{ Label = 'Cowork'     ; Flag = @('--cowork') ; Dir = Join-Path $env:USERPROFILE '.claude\cowork_plugins' }
    code   = @{ Label = 'Claude Code'; Flag = @()           ; Dir = Join-Path $env:USERPROFILE '.claude\plugins' }
}

function Write-Step { param([string]$Text) Write-Host "  $Text" }
function Write-Ok   { param([string]$Text) Write-Host "  OK    $Text" -ForegroundColor Green }
function Write-Warn { param([string]$Text) Write-Host "  WARN  $Text" -ForegroundColor Yellow }
function Write-Fail { param([string]$Text) Write-Host "  FAIL  $Text" -ForegroundColor Red }

<#
    Deletes the partial directories a failed attempt leaves behind. A retry that starts on top of
    somebody else's debris fails for a second, different reason, and the second reason is the one
    that gets reported — so the ground is cleared before every retry rather than after a failure.
    `cmd /c rmdir` rather than Remove-Item because it does not stop on a single locked file, which
    is the exact condition being recovered from.
#>
function Clear-Debris {
    param([string]$StoreDir)
    foreach ($pattern in @('cache\temp_local_*', 'marketplaces\Xenthai-Plugin', 'marketplaces\*-Plugin')) {
        Get-ChildItem (Join-Path $StoreDir (Split-Path $pattern -Parent)) `
            -Filter (Split-Path $pattern -Leaf) -Directory -Force -ErrorAction SilentlyContinue |
        ForEach-Object { cmd /c rmdir /s /q "`"$($_.FullName)`"" 2>&1 | Out-Null }
    }
}

<#
    Runs one CLI step until it stops failing for a transient reason.

    Only EPERM and the CLI's own "Failed to finalize marketplace cache" wrapper are treated as
    retryable. Anything else — a bad marketplace name, a validation error, no network — is a real
    answer, and repeating a real answer ten times only delays reporting it.
#>
function Invoke-WithRetry {
    param(
        [string]$Label,
        [string[]]$Arguments,
        [string]$StoreDir,
        [int]$Max
    )
    for ($i = 1; $i -le $Max; $i++) {
        $output = (& claude @Arguments 2>&1 | Out-String)

        if ($output -notmatch 'EPERM|Failed to finalize|Failed to install|Failed to add') {
            if ($i -gt 1) { Write-Ok "$Label (succeeded on attempt $i of $Max)" }
            else          { Write-Ok  $Label }
            return $true
        }

        if ($output -notmatch 'EPERM|Failed to finalize') {
            Write-Fail "$Label — not a transient failure, so not retried:"
            Write-Host ($output.Trim() -split "`r?`n" | ForEach-Object { "        $_" }) -ForegroundColor DarkGray
            return $false
        }

        Write-Step "$Label — attempt $i of $Max hit the Defender rename lock; clearing and retrying"
        Clear-Debris -StoreDir $StoreDir
        Start-Sleep -Seconds 4
    }
    Write-Fail "$Label — still failing after $Max attempts. Add ~\.claude to Defender's exclusions (see the note this script prints at the end) and run it again."
    return $false
}

<#
    Installs the render engine's dependency into the plugin's copy in the store's cache.
    Idempotent, and silent when there was nothing to do.
#>
function Install-EngineDependency {
    param([string]$StoreDir, [string]$Label)

    $cache = Join-Path $StoreDir "cache\$MarketplaceName\$PluginName"
    if (-not (Test-Path $cache)) { Write-Warn "$Label — no plugin cache found, so the render engine was not checked"; return }

    foreach ($version in Get-ChildItem $cache -Directory -Force) {
        if (Test-Path (Join-Path $version.FullName 'node_modules\playwright-core\package.json')) {
            Write-Ok "$Label — render engine already present ($($version.Name))"
            continue
        }
        Push-Location $version.FullName
        & npm install --ignore-scripts --no-audit --no-fund 2>&1 | Out-Null
        Pop-Location
        if (Test-Path (Join-Path $version.FullName 'node_modules\playwright-core\package.json')) {
            Write-Ok "$Label — render engine installed ($($version.Name))"
        } else {
            Write-Fail "$Label — render engine could not be installed; social-produce will fail. Run: npm install --ignore-scripts in $($version.FullName)"
        }
    }
}

# --- preflight -------------------------------------------------------------------------------

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Fail 'The claude CLI is not on PATH. Install Claude Code first.'
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Warn 'npm is not on PATH; the render engine cannot be installed and social-produce will fail.'
}

Write-Host ''
Write-Host "Xenth AI plugin install" -ForegroundColor Cyan
Write-Host "  source: $Source"
Write-Host ''

$targets = if ($Store -eq 'both') { @('cowork', 'code') } else { @($Store) }
$failed  = @()

foreach ($key in $targets) {
    $s = $Stores[$key]
    Write-Host "$($s.Label) — $($s.Dir)" -ForegroundColor Cyan

    # The catalogue. Added only when absent, because `marketplace add` overwrites a declaration the
    # app may own, and because a store that already lists it needs nothing.
    $listed = (& claude plugin marketplace list @($s.Flag) 2>&1 | Out-String)
    if ($listed -match [regex]::Escape($MarketplaceName)) {
        Write-Ok "marketplace '$MarketplaceName' already present — left as it is"
    } else {
        if (-not (Invoke-WithRetry -Label "marketplace add" -StoreDir $s.Dir -Max $Attempts `
                    -Arguments (@('plugin', 'marketplace', 'add', $Source) + $s.Flag))) {
            $failed += "$($s.Label): marketplace"
            Write-Host ''
            continue
        }
    }

    # The install. The marketplace carries the catalogue and installs nothing — this is the step
    # that was missing every time the marketplace reported success and no skills appeared.
    if (-not (Invoke-WithRetry -Label "install $PluginId" -StoreDir $s.Dir -Max $Attempts `
                -Arguments (@('plugin', 'install', $PluginId) + $s.Flag))) {
        $failed += "$($s.Label): install"
        Write-Host ''
        continue
    }

    Install-EngineDependency -StoreDir $s.Dir -Label 'engine'

    # Proof, not assertion. `details` reads the installed copy and counts what it actually found,
    # so a wrong count here means the install landed but the plugin did not load.
    $details = (& claude plugin details $PluginName @($s.Flag) 2>&1 | Out-String)
    if ($details -match 'Skills \((\d+)\)') {
        Write-Ok "$($Matches[1]) skills loaded"
    } else {
        Write-Fail "installed, but no skills were found — run: claude plugin details $PluginName $($s.Flag -join ' ')"
        $failed += "$($s.Label): skills"
    }
    Write-Host ''
}

# --- report ----------------------------------------------------------------------------------

if ($failed.Count -eq 0) {
    Write-Host "Done. Restart the Claude app for Cowork to pick the plugin up." -ForegroundColor Green
} else {
    Write-Host "Incomplete: $($failed -join '; ')" -ForegroundColor Red
    Write-Host ''
    Write-Host "If the failures were the Defender rename lock, exclude the plugin stores once, in a" -ForegroundColor Yellow
    Write-Host "terminal running as administrator, and the retries stop being necessary:" -ForegroundColor Yellow
    Write-Host "    Add-MpPreference -ExclusionPath `"`$env:USERPROFILE\.claude`"" -ForegroundColor Yellow
    exit 1
}
