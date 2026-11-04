# Refusals

## Confirmable operations

| Operation | Preview tool | Permission checked again at confirm |
| --- | --- | --- |
| `whatsapp.update_quick_reply` | `business_preview_update_quick_reply` | `business.manage` |
| `whatsapp.delete_quick_reply` | `business_preview_delete_quick_reply` | `business.manage` |
| `whatsapp.set_quick_reply_file` | `business_preview_set_quick_reply_file` | `business.manage` |
| `whatsapp.update_business_profile` | `business_preview_update_profile` | `business.manage` |
| `whatsapp.update_business_hours` | `business_preview_update_hours` | `business.manage` |
| `whatsapp.update_business_limits` | `business_preview_update_limits` | `business.manage` |
| `whatsapp.update_brand` | `business_preview_update_brand` | `business.manage` |
| `whatsapp.export_business` | `business_preview_export` | `business.manage` |
| `whatsapp.send_attachment` | `whatsapp_preview_send_attachment` | `chats.reply` |
| `whatsapp.send_contact_card` | `whatsapp_preview_send_contact_card` | `chats.reply` |
| `meetings.delete_task` | `meetings_preview_task_delete` | `meetings.record` |
| `meetings.delete_meeting` | `meetings_preview_delete` | `meetings.record` |
| `meetings.merge_speakers` | `meetings_preview_merge_speakers` | `meetings.record` |
| `meetings.split_speaker` | `meetings_preview_split_speaker` | `meetings.record` |
| `meetings.send_tasks` | `meetings_preview_task_delivery` | `meetings.send_tasks` |
| `contacts.commit` | `contacts_preview_manage` | `chats.reply` |
| `facebook.comment_reply` | `facebook_preview_comment_reply` | `chats.reply` |
| `facebook.comment_moderate` | `facebook_preview_moderate_comment` | `chats.reply` |
| `facebook.comment_state` | `facebook_preview_comment_state` | `chats.reply` |
| `facebook.send_attachment` | `facebook_preview_send_attachment` | `chats.reply` |
| `instagram.comment_reply` | `instagram_preview_comment_reply` | `chats.reply` |
| `instagram.comment_moderate` | `instagram_preview_moderate_comment` | `chats.reply` |
| `instagram.comment_state` | `instagram_preview_comment_state` | `chats.reply` |
| `instagram.send_attachment` | `instagram_preview_send_attachment` | `chats.reply` |
| `publishing.publish` | `publishing_preview_publish` | `publishing.manage` |
| `publishing.delete_post` | `publishing_preview_delete` | `publishing.manage` |
| `publishing.remove_target` | `publishing_preview_remove_account` | `publishing.manage` |
| `publishing.delete_media` | `publishing_preview_delete_media` | `publishing.manage` |
| `publishing.edit` | `publishing_preview_edit_scheduled_post` | `publishing.manage` |
| `publishing.delete_label` | `publishing_preview_delete_label` | `publishing.manage` |
| `links.disable` | `links_preview_disable` | `publishing.manage` |
| `links.delete` | `links_preview_delete` | `publishing.manage` |
| `classification.update_topics` | `classification_preview_update_topics` | `business.manage` |
| `threads.comment_reply` | `threads_preview_comment_reply` | `chats.reply` |
| `threads.comment_moderate` | `threads_preview_moderate_comment` | `chats.reply` |
| `threads.comment_state` | `threads_preview_comment_state` | `chats.reply` |
| `tiktok.comment_reply` | `tiktok_preview_comment_reply` | `chats.reply` |
| `tiktok.comment_moderate` | `tiktok_preview_moderate_comment` | `chats.reply` |
| `tiktok.comment_state` | `tiktok_preview_comment_state` | `chats.reply` |
| `tiktok.ads_status` | `tiktok_ads_preview_status` | `ads.manage` |
| `tiktok.ads_budget` | `tiktok_ads_preview_budget` | `ads.manage` |
| `agents.disconnect_connection` | `connections_preview_disconnect` | `connections.manage` |
| `agents.rename` | `agents_preview_rename` | `connections.manage` |
| `agents.set_avatar` | `agents_preview_set_avatar` | `connections.manage` |

## Permissions

- `chats.read`: `business_get_context`, `whatsapp_list_conversations`, `whatsapp_get_conversation`, `whatsapp_search_messages`, `whatsapp_show_inbox`, `whatsapp_get_contact`, `whatsapp_list_templates`, `whatsapp_get_media`, `whatsapp_ui_media`, `whatsapp_export_conversation`, `whatsapp_get_assignment`, `business_usage`, `business_get_settings`, `business_get_brand`, `whatsapp_transcribe_voice_note`, `whatsapp_list_schedules`, `contacts_list`, `contacts_search`, `contacts_get`, `contacts_duplicates`, `contacts_timeline`, `contacts_list_notes`, `contacts_list_merges`, `facebook_list_conversations`, `facebook_get_conversation`, `facebook_search_messages`, `facebook_list_comments`, `facebook_get_comment`, `instagram_list_conversations`, `instagram_get_conversation`, `instagram_search_messages`, `instagram_list_comments`, `instagram_get_comment`, `classification_search`, `threads_list_comments`, `threads_get_comment`, `tiktok_list_comments`, `tiktok_get_comment`, `workspace_digest`, `trash_list`, `agents_list`, `pending_list`, `pending_get`
- `chats.reply`: `whatsapp_update_contact`, `whatsapp_send_message`, `whatsapp_send_template`, `whatsapp_mark_read`, `whatsapp_save_lead`, `whatsapp_manage_chat`, `approvals_propose`, `whatsapp_assign`, `whatsapp_set_handoff`, `whatsapp_preview_send_attachment`, `whatsapp_preview_send_contact_card`, `whatsapp_schedule_message`, `whatsapp_update_schedule`, `whatsapp_cancel_schedule`, `contacts_create`, `contacts_update`, `contacts_dismiss_duplicate`, `contacts_preview_manage`, `contacts_add_identity`, `contacts_remove_identity`, `contacts_set_state`, `contacts_set_consent`, `contacts_create_lead`, `contacts_update_lead`, `contacts_restore_trash`, `contacts_add_note`, `facebook_send_message`, `facebook_send_media`, `facebook_mark_read`, `facebook_manage_chat`, `facebook_preview_comment_reply`, `facebook_preview_moderate_comment`, `facebook_preview_comment_state`, `facebook_preview_send_attachment`, `instagram_send_message`, `instagram_send_media`, `instagram_mark_read`, `instagram_manage_chat`, `instagram_preview_comment_reply`, `instagram_preview_moderate_comment`, `instagram_preview_comment_state`, `instagram_preview_send_attachment`, `classification_correct_topic`, `threads_preview_comment_reply`, `threads_preview_moderate_comment`, `threads_preview_comment_state`, `tiktok_preview_comment_reply`, `tiktok_preview_moderate_comment`, `tiktok_preview_comment_state`, `agents_request_actions`, `pending_dismiss_turn`, `pending_regenerate_draft`, `workspace_report_issue`
- `leads.read`: `whatsapp_list_leads`, `whatsapp_export_leads`
- `audit.read`: `whatsapp_list_actions`, `audit_list`
- `billing.read`: `business_credits`
- `business.manage`: `business_create_quick_reply`, `business_preview_update_quick_reply`, `business_preview_delete_quick_reply`, `business_preview_set_quick_reply_file`, `business_preview_update_profile`, `business_preview_update_hours`, `business_preview_update_limits`, `business_preview_update_brand`, `business_preview_export`, `classification_preview_update_topics`, `workspace_propose_limits`
- `meetings.read`: `meetings_list`, `meetings_get`, `meetings_search`, `meetings_list_deliveries`
- `meetings.read_transcripts`: `meetings_transcript`
- `meetings.record`: `meetings_set_participant`, `meetings_create_task`, `meetings_update_task`, `meetings_rename`, `meetings_retry`, `meetings_preview_task_delete`, `meetings_preview_delete`, `meetings_unlink_participant`, `meetings_preview_merge_speakers`, `meetings_preview_split_speaker`, `contacts_link_meeting`
- `meetings.send_tasks`: `meetings_record_action`, `meetings_set_task_done`, `meetings_preview_task_delivery`
- `analytics.read`: `analytics_overview`, `analytics_series`, `analytics_posts`, `analytics_ads`, `analytics_audience`, `analytics_sources`, `analytics_topics`, `tiktok_ads_list_campaigns`
- `publishing.read`: `publishing_list_channels`, `publishing_list_posts`, `publishing_get_post`, `publishing_find_slot`, `publishing_list_media`, `publishing_post_stats`, `publishing_list_labels`, `links_list`, `links_get_stats`, `links_get`
- `publishing.manage`: `publishing_create_draft`, `publishing_update_post`, `publishing_upload_media_from_url`, `publishing_update_account_prefs`, `publishing_duplicate_post`, `publishing_preview_publish`, `publishing_preview_delete`, `publishing_preview_delete_media`, `publishing_preview_remove_account`, `publishing_preview_edit_scheduled_post`, `publishing_update_post_settings`, `publishing_update_media_alt`, `publishing_set_release_id`, `publishing_save_tag`, `publishing_save_set`, `publishing_save_signature`, `publishing_preview_delete_label`, `links_create_campaign`, `links_create`, `links_update`, `links_preview_disable`, `links_preview_delete`
- `ads.manage`: `tiktok_ads_preview_status`, `tiktok_ads_preview_budget`
- `connections.manage`: `agents_get_rules`, `connections_list`, `connections_check_channel`, `connections_link_instagram`, `connections_check_ads`, `connections_preview_disconnect`, `connections_list_accounts`, `agents_propose_change`, `agents_preview_set_avatar`, `agents_preview_rename`, `connections_set_listing_preset`
- `team.manage`: `team_list`, `workspace_propose_change`, `team_propose_change`
- `approvals.decide`: `pending_propose_decision`
- `work.read`: `work_search`, `work_read`, `work_artifact_read`, `work_project_list`
- `work.write`: `work_open`, `work_update`, `work_artifact_put`
- `work.code`: `work_code`
- `work.manage`: `work_project_create`
