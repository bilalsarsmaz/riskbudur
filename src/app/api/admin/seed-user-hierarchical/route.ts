import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// HIERARCHICAL USER TRANSLATIONS
// user.compose.*
// user.modal.*
// user.settings.*
// user.messages.*
// user.notifications.*
// user.explore.*
// user.bookmarks.*
// user.trending.* (and others)

export async function POST(request: Request) {
    try {
        const token = request.headers.get("authorization")?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || (decoded.role !== "ROOTADMIN" && decoded.role !== "ADMIN")) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const translations = [
            // USER COMPOSE
            { languageCode: 'tr', key: 'user.compose.placeholder', value: 'Ne düşünüyorsun?' },
            { languageCode: 'en', key: 'user.compose.placeholder', value: 'What\'s on your mind?' },
            { languageCode: 'fr', key: 'user.compose.placeholder', value: 'What\'s on your mind?' },
            { languageCode: 'it', key: 'user.compose.placeholder', value: 'What\'s on your mind?' },
            { languageCode: 'tr', key: 'user.compose.placeholder_anonymous', value: 'Anonim olarak paylaşacaksınız...' },
            { languageCode: 'en', key: 'user.compose.placeholder_anonymous', value: 'Sharing anonymously...' },
            { languageCode: 'fr', key: 'user.compose.placeholder_anonymous', value: 'Sharing anonymously...' },
            { languageCode: 'it', key: 'user.compose.placeholder_anonymous', value: 'Sharing anonymously...' },
            { languageCode: 'tr', key: 'user.compose.error_empty', value: 'Post içeriği boş olamaz' },
            { languageCode: 'en', key: 'user.compose.error_empty', value: 'Post content cannot be empty' },
            { languageCode: 'fr', key: 'user.compose.error_empty', value: 'Post content cannot be empty' },
            { languageCode: 'it', key: 'user.compose.error_empty', value: 'Post content cannot be empty' },
            { languageCode: 'tr', key: 'user.compose.error_session', value: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.' },
            { languageCode: 'en', key: 'user.compose.error_session', value: 'Session expired. Please log in again.' },
            { languageCode: 'fr', key: 'user.compose.error_session', value: 'Session expired. Please log in again.' },
            { languageCode: 'it', key: 'user.compose.error_session', value: 'Session expired. Please log in again.' },
            { languageCode: 'tr', key: 'user.compose.error_upload_failed', value: 'Dosya yüklenemedi' },
            { languageCode: 'en', key: 'user.compose.error_upload_failed', value: 'File upload failed' },
            { languageCode: 'fr', key: 'user.compose.error_upload_failed', value: 'File upload failed' },
            { languageCode: 'it', key: 'user.compose.error_upload_failed', value: 'File upload failed' },
            { languageCode: 'tr', key: 'user.compose.error_file_size', value: 'Dosya boyutu çok büyük (Max 50MB)' },
            { languageCode: 'en', key: 'user.compose.error_file_size', value: 'File size too large (Max 50MB)' },
            { languageCode: 'fr', key: 'user.compose.error_file_size', value: 'File size too large (Max 50MB)' },
            { languageCode: 'it', key: 'user.compose.error_file_size', value: 'File size too large (Max 50MB)' },
            { languageCode: 'tr', key: 'user.compose.error_poll_min_options', value: 'Anket için en az 2 seçenek gereklidir.' },
            { languageCode: 'en', key: 'user.compose.error_poll_min_options', value: 'Minimum 2 options required for poll.' },
            { languageCode: 'fr', key: 'user.compose.error_poll_min_options', value: 'Minimum 2 options required for poll.' },
            { languageCode: 'it', key: 'user.compose.error_poll_min_options', value: 'Minimum 2 options required for poll.' },
            { languageCode: 'tr', key: 'user.compose.error_poll_min_duration', value: 'Anket süresi en az 5 dakika olmalıdır.' },
            { languageCode: 'en', key: 'user.compose.error_poll_min_duration', value: 'Poll duration must be at least 5 minutes.' },
            { languageCode: 'fr', key: 'user.compose.error_poll_min_duration', value: 'Poll duration must be at least 5 minutes.' },
            { languageCode: 'it', key: 'user.compose.error_poll_min_duration', value: 'Poll duration must be at least 5 minutes.' },
            { languageCode: 'tr', key: 'user.compose.error_generic', value: 'Bir hata oluştu' },
            { languageCode: 'en', key: 'user.compose.error_generic', value: 'An error occurred' },
            { languageCode: 'fr', key: 'user.compose.error_generic', value: 'An error occurred' },
            { languageCode: 'it', key: 'user.compose.error_generic', value: 'An error occurred' },
            { languageCode: 'tr', key: 'user.compose.link_preview_loading', value: 'Link önizlemesi yükleniyor...' },
            { languageCode: 'en', key: 'user.compose.link_preview_loading', value: 'Loading link preview...' },
            { languageCode: 'fr', key: 'user.compose.link_preview_loading', value: 'Loading link preview...' },
            { languageCode: 'it', key: 'user.compose.link_preview_loading', value: 'Loading link preview...' },
            { languageCode: 'tr', key: 'user.compose.poll_options', value: 'Anket Seçenekleri' },
            { languageCode: 'en', key: 'user.compose.poll_options', value: 'Poll Options' },
            { languageCode: 'fr', key: 'user.compose.poll_options', value: 'Poll Options' },
            { languageCode: 'it', key: 'user.compose.poll_options', value: 'Poll Options' },
            { languageCode: 'tr', key: 'user.compose.poll_option_placeholder', value: 'Seçenek {n}' },
            { languageCode: 'en', key: 'user.compose.poll_option_placeholder', value: 'Option {n}' },
            { languageCode: 'fr', key: 'user.compose.poll_option_placeholder', value: 'Option {n}' },
            { languageCode: 'it', key: 'user.compose.poll_option_placeholder', value: 'Option {n}' },
            { languageCode: 'tr', key: 'user.compose.add_option', value: 'Seçenek Ekle' },
            { languageCode: 'en', key: 'user.compose.add_option', value: 'Add Option' },
            { languageCode: 'fr', key: 'user.compose.add_option', value: 'Add Option' },
            { languageCode: 'it', key: 'user.compose.add_option', value: 'Add Option' },
            { languageCode: 'tr', key: 'user.compose.poll_duration', value: 'Anket uzunluğu' },
            { languageCode: 'en', key: 'user.compose.poll_duration', value: 'Poll duration' },
            { languageCode: 'fr', key: 'user.compose.poll_duration', value: 'Poll duration' },
            { languageCode: 'it', key: 'user.compose.poll_duration', value: 'Poll duration' },
            { languageCode: 'tr', key: 'user.compose.days', value: 'Gün' },
            { languageCode: 'en', key: 'user.compose.days', value: 'Days' },
            { languageCode: 'fr', key: 'user.compose.days', value: 'Days' },
            { languageCode: 'it', key: 'user.compose.days', value: 'Days' },
            { languageCode: 'tr', key: 'user.compose.hours', value: 'Saat' },
            { languageCode: 'en', key: 'user.compose.hours', value: 'Hours' },
            { languageCode: 'fr', key: 'user.compose.hours', value: 'Hours' },
            { languageCode: 'it', key: 'user.compose.hours', value: 'Hours' },
            { languageCode: 'tr', key: 'user.compose.minutes', value: 'Dakika' },
            { languageCode: 'en', key: 'user.compose.minutes', value: 'Minutes' },
            { languageCode: 'fr', key: 'user.compose.minutes', value: 'Minutes' },
            { languageCode: 'it', key: 'user.compose.minutes', value: 'Minutes' },
            { languageCode: 'tr', key: 'user.compose.button_post', value: 'Paylaş' },
            { languageCode: 'en', key: 'user.compose.button_post', value: 'Post' },
            { languageCode: 'fr', key: 'user.compose.button_post', value: 'Post' },
            { languageCode: 'it', key: 'user.compose.button_post', value: 'Post' },
            { languageCode: 'tr', key: 'user.compose.anonymous_mode', value: 'Anonim mod' },
            { languageCode: 'en', key: 'user.compose.anonymous_mode', value: 'Anonymous mode' },
            { languageCode: 'fr', key: 'user.compose.anonymous_mode', value: 'Anonymous mode' },
            { languageCode: 'it', key: 'user.compose.anonymous_mode', value: 'Anonymous mode' },
            { languageCode: 'tr', key: 'user.compose.disable_anonymous', value: 'Anonim modu kapat' },
            { languageCode: 'en', key: 'user.compose.disable_anonymous', value: 'Disable anonymous mode' },
            { languageCode: 'fr', key: 'user.compose.disable_anonymous', value: 'Disable anonymous mode' },
            { languageCode: 'it', key: 'user.compose.disable_anonymous', value: 'Disable anonymous mode' },
            { languageCode: 'tr', key: 'user.compose.enable_anonymous', value: 'Anonim modu aç' },
            { languageCode: 'en', key: 'user.compose.enable_anonymous', value: 'Enable anonymous mode' },
            { languageCode: 'fr', key: 'user.compose.enable_anonymous', value: 'Enable anonymous mode' },
            { languageCode: 'it', key: 'user.compose.enable_anonymous', value: 'Enable anonymous mode' },
            { languageCode: 'tr', key: 'user.compose.add_photo', value: 'Fotoğraf ekle' },
            { languageCode: 'en', key: 'user.compose.add_photo', value: 'Add photo' },
            { languageCode: 'fr', key: 'user.compose.add_photo', value: 'Add photo' },
            { languageCode: 'it', key: 'user.compose.add_photo', value: 'Add photo' },
            { languageCode: 'tr', key: 'user.compose.add_video', value: 'Video ekle' },
            { languageCode: 'en', key: 'user.compose.add_video', value: 'Add video' },
            { languageCode: 'fr', key: 'user.compose.add_video', value: 'Add video' },
            { languageCode: 'it', key: 'user.compose.add_video', value: 'Add video' },
            { languageCode: 'tr', key: 'user.compose.add_gif', value: 'GIF ekle' },
            { languageCode: 'en', key: 'user.compose.add_gif', value: 'Add GIF' },
            { languageCode: 'fr', key: 'user.compose.add_gif', value: 'Add GIF' },
            { languageCode: 'it', key: 'user.compose.add_gif', value: 'Add GIF' },
            { languageCode: 'tr', key: 'user.compose.add_emoji', value: 'Emoji ekle' },
            { languageCode: 'en', key: 'user.compose.add_emoji', value: 'Add Emoji' },
            { languageCode: 'fr', key: 'user.compose.add_emoji', value: 'Add Emoji' },
            { languageCode: 'it', key: 'user.compose.add_emoji', value: 'Add Emoji' },
            { languageCode: 'tr', key: 'user.compose.add_poll', value: 'Anket ekle' },
            { languageCode: 'en', key: 'user.compose.add_poll', value: 'Add Poll' },
            { languageCode: 'fr', key: 'user.compose.add_poll', value: 'Add Poll' },
            { languageCode: 'it', key: 'user.compose.add_poll', value: 'Add Poll' },
            { languageCode: 'tr', key: 'user.compose.posting', value: 'Paylaşılıyor...' },
            { languageCode: 'en', key: 'user.compose.posting', value: 'Posting...' },
            { languageCode: 'fr', key: 'user.compose.posting', value: 'Posting...' },
            { languageCode: 'it', key: 'user.compose.posting', value: 'Posting...' },
            { languageCode: 'tr', key: 'user.compose.reply', value: 'Yanıtla' },
            { languageCode: 'en', key: 'user.compose.reply', value: 'Reply' },
            { languageCode: 'fr', key: 'user.compose.reply', value: 'Reply' },
            { languageCode: 'it', key: 'user.compose.reply', value: 'Reply' },
            { languageCode: 'tr', key: 'user.compose.post', value: 'Paylaş' },
            { languageCode: 'en', key: 'user.compose.post', value: 'Post' },
            { languageCode: 'fr', key: 'user.compose.post', value: 'Post' },
            { languageCode: 'it', key: 'user.compose.post', value: 'Post' },
            { languageCode: 'tr', key: 'user.compose.search_emoji', value: 'Emoji ara...' },
            { languageCode: 'en', key: 'user.compose.search_emoji', value: 'Search emoji...' },
            { languageCode: 'fr', key: 'user.compose.search_emoji', value: 'Search emoji...' },
            { languageCode: 'it', key: 'user.compose.search_emoji', value: 'Search emoji...' },
            { languageCode: 'tr', key: 'user.compose.select_gif', value: 'GIF Seç' },
            { languageCode: 'en', key: 'user.compose.select_gif', value: 'Select GIF' },
            { languageCode: 'fr', key: 'user.compose.select_gif', value: 'Select GIF' },
            { languageCode: 'it', key: 'user.compose.select_gif', value: 'Select GIF' },
            { languageCode: 'tr', key: 'user.compose.gif_error', value: 'GIF yüklenemedi.' },
            { languageCode: 'en', key: 'user.compose.gif_error', value: 'Failed to load GIF.' },
            { languageCode: 'fr', key: 'user.compose.gif_error', value: 'Failed to load GIF.' },
            { languageCode: 'it', key: 'user.compose.gif_error', value: 'Failed to load GIF.' },

            // USER PROFILE/MODAL
            { languageCode: 'tr', key: 'user.modal.quote.add_thought', value: 'Bir düşünce ekle...' },
            { languageCode: 'en', key: 'user.modal.quote.add_thought', value: 'Add a thought...' },
            { languageCode: 'fr', key: 'user.modal.quote.add_thought', value: 'Add a thought...' },
            { languageCode: 'it', key: 'user.modal.quote.add_thought', value: 'Add a thought...' },
            { languageCode: 'tr', key: 'user.modal.quote.button_quote', value: 'Alıntıla' },
            { languageCode: 'en', key: 'user.modal.quote.button_quote', value: 'Quote' },
            { languageCode: 'fr', key: 'user.modal.quote.button_quote', value: 'Quote' },
            { languageCode: 'it', key: 'user.modal.quote.button_quote', value: 'Quote' },
            { languageCode: 'tr', key: 'user.modal.comment.write_reply', value: 'Yanıtını yaz...' },
            { languageCode: 'en', key: 'user.modal.comment.write_reply', value: 'Write your reply...' },
            { languageCode: 'fr', key: 'user.modal.comment.write_reply', value: 'Write your reply...' },
            { languageCode: 'it', key: 'user.modal.comment.write_reply', value: 'Write your reply...' },
            { languageCode: 'tr', key: 'user.modal.comment.reply', value: 'Yanıtla' },
            { languageCode: 'en', key: 'user.modal.comment.reply', value: 'Reply' },
            { languageCode: 'fr', key: 'user.modal.comment.reply', value: 'Reply' },
            { languageCode: 'it', key: 'user.modal.comment.reply', value: 'Reply' },

            // USER SETTINGS
            { languageCode: 'tr', key: 'user.settings.password.title', value: 'Şifreni değiştir' },
            { languageCode: 'en', key: 'user.settings.password.title', value: 'Change your password' },
            { languageCode: 'fr', key: 'user.settings.password.title', value: 'Change your password' },
            { languageCode: 'it', key: 'user.settings.password.title', value: 'Change your password' },
            { languageCode: 'tr', key: 'user.settings.password.subtitle', value: 'Hesabının güvenliği için güçlü bir şifre kullan.' },
            { languageCode: 'en', key: 'user.settings.password.subtitle', value: 'Use a strong password for your account security.' },
            { languageCode: 'fr', key: 'user.settings.password.subtitle', value: 'Use a strong password for your account security.' },
            { languageCode: 'it', key: 'user.settings.password.subtitle', value: 'Use a strong password for your account security.' },
            { languageCode: 'tr', key: 'user.settings.password.current', value: 'Mevcut Şifre' },
            { languageCode: 'en', key: 'user.settings.password.current', value: 'Current Password' },
            { languageCode: 'fr', key: 'user.settings.password.current', value: 'Current Password' },
            { languageCode: 'it', key: 'user.settings.password.current', value: 'Current Password' },
            { languageCode: 'tr', key: 'user.settings.password.new', value: 'Yeni Şifre' },
            { languageCode: 'en', key: 'user.settings.password.new', value: 'New Password' },
            { languageCode: 'fr', key: 'user.settings.password.new', value: 'New Password' },
            { languageCode: 'it', key: 'user.settings.password.new', value: 'New Password' },
            { languageCode: 'tr', key: 'user.settings.password.confirm', value: 'Yeni Şifre (Tekrar)' },
            { languageCode: 'en', key: 'user.settings.password.confirm', value: 'Confirm New Password' },
            { languageCode: 'fr', key: 'user.settings.password.confirm', value: 'Confirm New Password' },
            { languageCode: 'it', key: 'user.settings.password.confirm', value: 'Confirm New Password' },
            { languageCode: 'tr', key: 'user.settings.password.save', value: 'Kaydet' },
            { languageCode: 'en', key: 'user.settings.password.save', value: 'Save' },
            { languageCode: 'fr', key: 'user.settings.password.save', value: 'Save' },
            { languageCode: 'it', key: 'user.settings.password.save', value: 'Save' },
            { languageCode: 'tr', key: 'user.settings.password.error_mismatch', value: 'Yeni şifreler eşleşmiyor!' },
            { languageCode: 'en', key: 'user.settings.password.error_mismatch', value: 'New passwords do not match!' },
            { languageCode: 'fr', key: 'user.settings.password.error_mismatch', value: 'New passwords do not match!' },
            { languageCode: 'it', key: 'user.settings.password.error_mismatch', value: 'New passwords do not match!' },
            { languageCode: 'tr', key: 'user.settings.password.success', value: 'Şifre başarıyla güncellendi!' },
            { languageCode: 'en', key: 'user.settings.password.success', value: 'Password updated successfully!' },
            { languageCode: 'fr', key: 'user.settings.password.success', value: 'Password updated successfully!' },
            { languageCode: 'it', key: 'user.settings.password.success', value: 'Password updated successfully!' },
            { languageCode: 'tr', key: 'user.settings.password.error_generic', value: 'Şifre güncellenirken bir hata oluştu.' },
            { languageCode: 'en', key: 'user.settings.password.error_generic', value: 'An error occurred while updating password.' },
            { languageCode: 'fr', key: 'user.settings.password.error_generic', value: 'An error occurred while updating password.' },
            { languageCode: 'it', key: 'user.settings.password.error_generic', value: 'An error occurred while updating password.' },
            { languageCode: 'tr', key: 'user.settings.verification.title', value: 'Mavi Tik Başvurusu' },
            { languageCode: 'en', key: 'user.settings.verification.title', value: 'Blue Tick Application' },
            { languageCode: 'fr', key: 'user.settings.verification.title', value: 'Blue Tick Application' },
            { languageCode: 'it', key: 'user.settings.verification.title', value: 'Blue Tick Application' },
            { languageCode: 'tr', key: 'user.settings.verification.id_name', value: 'Kimlikte yazan isminiz' },
            { languageCode: 'en', key: 'user.settings.verification.id_name', value: 'Name on your ID' },
            { languageCode: 'fr', key: 'user.settings.verification.id_name', value: 'Name on your ID' },
            { languageCode: 'it', key: 'user.settings.verification.id_name', value: 'Name on your ID' },
            { languageCode: 'tr', key: 'user.settings.verification.reason', value: 'Bize kendinizden veya markanızdan kısaca bahsedin...' },
            { languageCode: 'en', key: 'user.settings.verification.reason', value: 'Tell us briefly about yourself or your brand...' },
            { languageCode: 'fr', key: 'user.settings.verification.reason', value: 'Tell us briefly about yourself or your brand...' },
            { languageCode: 'it', key: 'user.settings.verification.reason', value: 'Tell us briefly about yourself or your brand...' },

            // USER MESSAGES
            { languageCode: 'tr', key: 'user.messages.title', value: 'Mesajlar' },
            { languageCode: 'en', key: 'user.messages.title', value: 'Messages' },
            { languageCode: 'fr', key: 'user.messages.title', value: 'Messages' },
            { languageCode: 'it', key: 'user.messages.title', value: 'Messages' },
            { languageCode: 'tr', key: 'user.messages.new_message', value: 'Yeni Mesaj' },
            { languageCode: 'en', key: 'user.messages.new_message', value: 'New Message' },
            { languageCode: 'fr', key: 'user.messages.new_message', value: 'New Message' },
            { languageCode: 'it', key: 'user.messages.new_message', value: 'New Message' },
            { languageCode: 'tr', key: 'user.messages.send_placeholder', value: 'Bir mesaj yaz...' },
            { languageCode: 'en', key: 'user.messages.send_placeholder', value: 'Write a message...' },
            { languageCode: 'fr', key: 'user.messages.send_placeholder', value: 'Write a message...' },
            { languageCode: 'it', key: 'user.messages.send_placeholder', value: 'Write a message...' },
            { languageCode: 'tr', key: 'user.messages.empty_state', value: 'Henüz mesaj yok' },
            { languageCode: 'en', key: 'user.messages.empty_state', value: 'No messages yet' },
            { languageCode: 'fr', key: 'user.messages.empty_state', value: 'No messages yet' },
            { languageCode: 'it', key: 'user.messages.empty_state', value: 'No messages yet' },
            { languageCode: 'tr', key: 'user.messages.search', value: 'Mesajlarda ara...' },
            { languageCode: 'en', key: 'user.messages.search', value: 'Search messages...' },
            { languageCode: 'fr', key: 'user.messages.search', value: 'Search messages...' },
            { languageCode: 'it', key: 'user.messages.search', value: 'Search messages...' },

            // USER NOTIFICATIONS
            { languageCode: 'tr', key: 'user.notifications.title', value: 'Bildirimler' },
            { languageCode: 'en', key: 'user.notifications.title', value: 'Notifications' },
            { languageCode: 'fr', key: 'user.notifications.title', value: 'Notifications' },
            { languageCode: 'it', key: 'user.notifications.title', value: 'Notifications' },
            { languageCode: 'tr', key: 'user.notifications.subtitle', value: 'Tehlike çanlarını görüntüle' },
            { languageCode: 'en', key: 'user.notifications.subtitle', value: 'View your alerts' },
            { languageCode: 'fr', key: 'user.notifications.subtitle', value: 'View your alerts' },
            { languageCode: 'it', key: 'user.notifications.subtitle', value: 'View your alerts' },
            { languageCode: 'tr', key: 'user.notifications.empty', value: 'Henüz bildirim yok.' },
            { languageCode: 'en', key: 'user.notifications.empty', value: 'No notifications yet.' },
            { languageCode: 'fr', key: 'user.notifications.empty', value: 'No notifications yet.' },
            { languageCode: 'it', key: 'user.notifications.empty', value: 'No notifications yet.' },
            { languageCode: 'tr', key: 'user.notifications.liked_post', value: 'gönderini beğendi' },
            { languageCode: 'en', key: 'user.notifications.liked_post', value: 'liked your post' },
            { languageCode: 'fr', key: 'user.notifications.liked_post', value: 'liked your post' },
            { languageCode: 'it', key: 'user.notifications.liked_post', value: 'liked your post' },
            { languageCode: 'tr', key: 'user.notifications.liked_reply', value: 'yanıtını beğendi' },
            { languageCode: 'en', key: 'user.notifications.liked_reply', value: 'liked your reply' },
            { languageCode: 'fr', key: 'user.notifications.liked_reply', value: 'liked your reply' },
            { languageCode: 'it', key: 'user.notifications.liked_reply', value: 'liked your reply' },
            { languageCode: 'tr', key: 'user.notifications.followed', value: 'seni takip etti' },
            { languageCode: 'en', key: 'user.notifications.followed', value: 'followed you' },
            { languageCode: 'fr', key: 'user.notifications.followed', value: 'followed you' },
            { languageCode: 'it', key: 'user.notifications.followed', value: 'followed you' },
            { languageCode: 'tr', key: 'user.notifications.replied', value: 'sana yanıt verdi' },
            { languageCode: 'en', key: 'user.notifications.replied', value: 'replied to you' },
            { languageCode: 'fr', key: 'user.notifications.replied', value: 'replied to you' },
            { languageCode: 'it', key: 'user.notifications.replied', value: 'replied to you' },
            { languageCode: 'tr', key: 'user.notifications.quoted', value: 'gönderini alıntıladı' },
            { languageCode: 'en', key: 'user.notifications.quoted', value: 'quoted your post' },
            { languageCode: 'fr', key: 'user.notifications.quoted', value: 'quoted your post' },
            { languageCode: 'it', key: 'user.notifications.quoted', value: 'quoted your post' },
            { languageCode: 'tr', key: 'user.notifications.mentioned', value: 'senden bahsetti' },
            { languageCode: 'en', key: 'user.notifications.mentioned', value: 'mentioned you' },
            { languageCode: 'fr', key: 'user.notifications.mentioned', value: 'mentioned you' },
            { languageCode: 'it', key: 'user.notifications.mentioned', value: 'mentioned you' },
            { languageCode: 'tr', key: 'user.notifications.system', value: 'Sistem Bildirimi' },
            { languageCode: 'en', key: 'user.notifications.system', value: 'System Notification' },
            { languageCode: 'fr', key: 'user.notifications.system', value: 'System Notification' },
            { languageCode: 'it', key: 'user.notifications.system', value: 'System Notification' },
            { languageCode: 'tr', key: 'user.notifications.and_others', value: 've diğer {count} kişi' },
            { languageCode: 'en', key: 'user.notifications.and_others', value: 'and {count} others' },
            { languageCode: 'fr', key: 'user.notifications.and_others', value: 'and {count} others' },
            { languageCode: 'it', key: 'user.notifications.and_others', value: 'and {count} others' },

            // USER EXPLORE
            { languageCode: 'tr', key: 'user.explore.title', value: 'Keşfet' },
            { languageCode: 'en', key: 'user.explore.title', value: 'Explore' },
            { languageCode: 'fr', key: 'user.explore.title', value: 'Explore' },
            { languageCode: 'it', key: 'user.explore.title', value: 'Explore' },
            { languageCode: 'tr', key: 'user.explore.search_placeholder', value: 'Ara...' },
            { languageCode: 'en', key: 'user.explore.search_placeholder', value: 'Search...' },
            { languageCode: 'fr', key: 'user.explore.search_placeholder', value: 'Search...' },
            { languageCode: 'it', key: 'user.explore.search_placeholder', value: 'Search...' },
            { languageCode: 'tr', key: 'user.explore.trending', value: 'Trendler' },
            { languageCode: 'en', key: 'user.explore.trending', value: 'Trending' },
            { languageCode: 'fr', key: 'user.explore.trending', value: 'Trending' },
            { languageCode: 'it', key: 'user.explore.trending', value: 'Trending' },
            { languageCode: 'tr', key: 'user.explore.for_you', value: 'Senin İçin' },
            { languageCode: 'en', key: 'user.explore.for_you', value: 'For You' },
            { languageCode: 'fr', key: 'user.explore.for_you', value: 'For You' },
            { languageCode: 'it', key: 'user.explore.for_you', value: 'For You' },

            // USER BOOKMARKS
            { languageCode: 'tr', key: 'user.bookmarks.title', value: 'Yer İmleri' },
            { languageCode: 'en', key: 'user.bookmarks.title', value: 'Bookmarks' },
            { languageCode: 'fr', key: 'user.bookmarks.title', value: 'Bookmarks' },
            { languageCode: 'it', key: 'user.bookmarks.title', value: 'Bookmarks' },
            { languageCode: 'tr', key: 'user.bookmarks.empty', value: 'Henüz kaydedilmiş gönderi yok' },
            { languageCode: 'en', key: 'user.bookmarks.empty', value: 'No saved posts yet' },
            { languageCode: 'fr', key: 'user.bookmarks.empty', value: 'No saved posts yet' },
            { languageCode: 'it', key: 'user.bookmarks.empty', value: 'No saved posts yet' },

            // USER SIDEBAR WIDGETS
            { languageCode: 'tr', key: 'user.trending.title', value: 'Gündem' },
            { languageCode: 'en', key: 'user.trending.title', value: 'Trending' },
            { languageCode: 'fr', key: 'user.trending.title', value: 'Trending' },
            { languageCode: 'it', key: 'user.trending.title', value: 'Trending' },
            { languageCode: 'tr', key: 'user.trending.posts_suffix', value: 'gönderi' },
            { languageCode: 'en', key: 'user.trending.posts_suffix', value: 'posts' },
            { languageCode: 'fr', key: 'user.trending.posts_suffix', value: 'posts' },
            { languageCode: 'it', key: 'user.trending.posts_suffix', value: 'posts' },
            { languageCode: 'tr', key: 'user.who_visited.title', value: 'Dikizleyenler' },
            { languageCode: 'en', key: 'user.who_visited.title', value: 'Who Visited' },
            { languageCode: 'fr', key: 'user.who_visited.title', value: 'Who Visited' },
            { languageCode: 'it', key: 'user.who_visited.title', value: 'Who Visited' },
            { languageCode: 'tr', key: 'user.who_visited.empty', value: 'Henüz kimse dikizlemedi...' },
            { languageCode: 'en', key: 'user.who_visited.empty', value: 'No visits yet...' },
            { languageCode: 'fr', key: 'user.who_visited.empty', value: 'No visits yet...' },
            { languageCode: 'it', key: 'user.who_visited.empty', value: 'No visits yet...' },
            { languageCode: 'tr', key: 'user.popular_posts.title', value: 'Popüler Postlar' },
            { languageCode: 'en', key: 'user.popular_posts.title', value: 'Popular Posts' },
            { languageCode: 'fr', key: 'user.popular_posts.title', value: 'Popular Posts' },
            { languageCode: 'it', key: 'user.popular_posts.title', value: 'Popular Posts' }
        ];

        let inserted = 0;
        let updated = 0;

        for (const trans of translations) {
            const existing = await prisma.translation.findUnique({
                where: {
                    languageCode_key: {
                        languageCode: trans.languageCode,
                        key: trans.key
                    }
                }
            });

            if (existing) {
                await prisma.translation.update({
                    where: {
                        languageCode_key: {
                            languageCode: trans.languageCode,
                            key: trans.key
                        }
                    },
                    data: { value: trans.value }
                });
                updated++;
            } else {
                await prisma.translation.create({
                    data: trans
                });
                inserted++;
            }
        }

        return NextResponse.json({
            message: "Hierarchical User translations seeded",
            inserted,
            updated,
            total: translations.length
        });
    } catch (error) {
        console.error("User seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed user translations", error: String(error) },
            { status: 500 }
        );
    }
}
