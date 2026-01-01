package com.ibadalrahman.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import android.os.Handler;
import android.os.Looper;
import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;

public class AdhanService extends Service {
    private static final String TAG = "AdhanService";
    private static final String CHANNEL_ID = "adhan_channel";
    private MediaPlayer mediaPlayer;
    private int originalVolume = -1;
    private AudioManager audioManager;
    private Timer fadeInTimer;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    private android.os.PowerManager.WakeLock wakeLock;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;

        // Acquire WakeLock immediately
        android.os.PowerManager powerManager = (android.os.PowerManager) getSystemService(Context.POWER_SERVICE);
        if (powerManager != null) {
            wakeLock = powerManager.newWakeLock(android.os.PowerManager.PARTIAL_WAKE_LOCK, "PrayerCompanion:AdhanServiceWakeLock");
            wakeLock.acquire(10 * 60 * 1000L /*10 minutes*/);
        }

        String action = intent.getAction();
        if ("STOP_ADHAN".equals(action)) {
            stopAdhan();
            return START_NOT_STICKY;
        }

        String prayerName = intent.getStringExtra("prayerName");
        String soundName = intent.getStringExtra("soundName"); // "adhan_makkah", "adhan_madinah", "adhan_egypt"

        startForeground(1, createNotification(prayerName));
        playAdhan(soundName);

        return START_STICKY;
    }

    private void playAdhan(String soundName) {
        if (mediaPlayer != null) {
            mediaPlayer.release();
        }

        // Map soundName to resource ID
        int soundResId = R.raw.adhan_makkah; // Default
        if ("adhan_madinah".equals(soundName)) soundResId = R.raw.adhan_madinah;
        else if ("adhan_egypt".equals(soundName)) soundResId = R.raw.adhan_egypt;

        mediaPlayer = MediaPlayer.create(this, soundResId);
        if (mediaPlayer == null) {
             Log.e(TAG, "Adhan sound not found for: " + soundName);
             stopAdhan(); // Stop service if sound fails
             return;
        }

        // Configure audio attributes for Alarm usage (Mandatory Alarm)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            mediaPlayer.setAudioAttributes(
                    new AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
            );
        } else {
             mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
        }

        Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + soundResId);

        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (audioManager != null) {
            try {
                // Save original volume to restore later
                originalVolume = audioManager.getStreamVolume(AudioManager.STREAM_ALARM);
                if (audioManager != null) {
                    // Requests audio focus to lower/pause other apps
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                        AudioAttributes focusAttrs = new AudioAttributes.Builder()
                                .setUsage(AudioAttributes.USAGE_ALARM)
                                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                                .build();
                        android.media.AudioFocusRequest focusRequest = new android.media.AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                                .setAudioAttributes(focusAttrs)
                                .build();
                        audioManager.requestAudioFocus(focusRequest);
                    } else {
                        //noinspection deprecation
                        audioManager.requestAudioFocus(null, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
                    }

                    // Read user preferences
                    SharedPreferences prefs = getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
                    int userVolumePercent = prefs.getInt("azanVolume", 100);
                    boolean smartDnd = prefs.getBoolean("smartDnd", false);
                    boolean azanFadeIn = prefs.getBoolean("azanFadeIn", false);

                    // Smart DND Check
                    int ringerMode = audioManager.getRingerMode();
                    if (smartDnd && (ringerMode == AudioManager.RINGER_MODE_SILENT || ringerMode == AudioManager.RINGER_MODE_VIBRATE)) {
                        Log.d(TAG, "Smart DND enabled and phone is silent/vibrate. Skipping audio.");
                        // We still show notification, but don't play sound.
                        // We should probably stopSelf immediately or just return?
                        // If we stopSelf, the notification might vanish if not careful.
                        // Let's just return and let notification stay (it's foreground).
                        // But wait, if we don't play sound, the service will keep running forever?
                        // No, we need to schedule a stop or just show notification and kill service.
                        // For now, let's just NOT play audio, but allow service to live? 
                        // Actually, if we don't play, we should probably stop the service so it doesn't drain battery holding wake lock.
                        // But we want the notification to be visible.
                        // Let's just return. The notification is "ongoing", user can dismiss it.
                        // Better: Stop the service but keep notification?
                        // Current implementation assumes service runs while playing.
                        // Let's just play silence? Or just return.
                        // If we return, we must release WakeLock.
                        if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
                        return; 
                    }

                    int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM);
                    int targetVolume = (int) (maxVolume * (userVolumePercent / 100.0));
                    
                    audioManager.setStreamVolume(AudioManager.STREAM_ALARM, targetVolume, 0);
                    Log.d(TAG, "Adhan volume set to: " + targetVolume + " (" + userVolumePercent + "%)");

                    // Initialize MediaPlayer
                    mediaPlayer = new MediaPlayer();
                    mediaPlayer.setDataSource(this, soundUri);
                    
                    mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM);
                    AudioAttributes.Builder attrs = new AudioAttributes.Builder();
                    attrs.setUsage(AudioAttributes.USAGE_ALARM);
                    attrs.setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION);
                    mediaPlayer.setAudioAttributes(attrs.build());
                    
                    mediaPlayer.setLooping(false);
                    mediaPlayer.prepare();

                    if (azanFadeIn) {
                        mediaPlayer.setVolume(0.01f, 0.01f); // Start very low
                        mediaPlayer.start();
                        startFadeIn(targetVolume, maxVolume); // Logic to increase volume
                    } else {
                        mediaPlayer.setVolume(1.0f, 1.0f); // Default full volume relative to Stream Volume
                        mediaPlayer.start();
                    }

                } // End of inner if (audioManager != null)
            } catch (IOException e) {
                Log.e(TAG, "Error setting data source or preparing media player", e);
                stopAdhan();
                return;
            } catch (Exception e) {
                Log.e(TAG, "Failed to set Adhan volume or start media player", e);
                stopAdhan();
                return;
            }
        } else {
            // Fallback if audioManager is null, try to play without volume control
            try {
                mediaPlayer = new MediaPlayer();
                mediaPlayer.setDataSource(this, soundUri);
                mediaPlayer.setAudioStreamType(AudioManager.STREAM_ALARM); // For older APIs
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mediaPlayer.setAudioAttributes(
                            new AudioAttributes.Builder()
                                    .setUsage(AudioAttributes.USAGE_ALARM)
                                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                    .build()
                    );
                }
                mediaPlayer.setLooping(false);
                mediaPlayer.prepare();
                mediaPlayer.start();
            } catch (IOException e) {
                Log.e(TAG, "Error setting data source or preparing media player (no audio manager)", e);
                stopAdhan();
                return;
            } catch (Exception e) {
                Log.e(TAG, "Error starting media player (no audio manager)", e);
                stopAdhan();
                return;
            }
        }

        mediaPlayer.setOnCompletionListener(mp -> stopAdhan());
    }

    private void stopAdhan() {
        if (mediaPlayer != null) {
            try {
                if (mediaPlayer.isPlaying()) {
                    mediaPlayer.stop();
                }
            } catch (Exception e) {
                Log.e(TAG, "Error stopping media player", e);
            } finally {
                mediaPlayer.release();
                mediaPlayer = null;
            }
        }
        
        // Restore original volume after Azan completes
        if (originalVolume != -1 && audioManager != null) {
            try {
                audioManager.setStreamVolume(AudioManager.STREAM_ALARM, originalVolume, 0);
                Log.d(TAG, "Restored original volume to: " + originalVolume);
            } catch (Exception e) {
                Log.e(TAG, "Failed to restore original volume", e);
            }
            originalVolume = -1;
        }
        
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }

        stopForeground(true);
        stopSelf();
    }

    private Notification createNotification(String prayerName) {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);

        Intent stopIntent = new Intent(this, AdhanService.class);
        stopIntent.setAction("STOP_ADHAN");
        PendingIntent stopPendingIntent = PendingIntent.getService(this, 0, stopIntent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Full Screen Intent for high priority
        Intent fullScreenIntent = new Intent(this, MainActivity.class);
        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(this, 0, fullScreenIntent, PendingIntent.FLAG_IMMUTABLE);

        String pName = prayerName != null ? prayerName.split("_")[0] : "Prayer";
        String title = "Prayer Time";
        String body = "It is time for " + pName;

        // Simple localization attempt (can be improved by passing localized strings from JS)
        if (pName.equalsIgnoreCase("fajr")) { title = "صلاة الفجر"; body = "حان الآن موعد صلاة الفجر"; }
        else if (pName.equalsIgnoreCase("dhuhr")) { title = "صلاة الظهر"; body = "حان الآن موعد صلاة الظهر"; }
        else if (pName.equalsIgnoreCase("asr")) { title = "صلاة العصر"; body = "حان الآن موعد صلاة العصر"; }
        else if (pName.equalsIgnoreCase("maghrib")) { title = "صلاة المغرب"; body = "حان الآن موعد صلاة المغرب"; }
        else if (pName.equalsIgnoreCase("isha")) { title = "صلاة العشاء"; body = "حان الآن موعد صلاة العشاء"; }

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(body)
                .setSmallIcon(R.mipmap.ic_launcher) // Note: Should ideally be a white-only icon for proper tinting
                .setColor(0xFF0F5132) // Dark Green #0F5132 matching the theme
                .setColorized(true)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .setContentIntent(pendingIntent)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "إيقاف / Stop", stopPendingIntent)
                .setOngoing(true)
                .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Adhan Service Channel",
                    NotificationManager.IMPORTANCE_HIGH
            );
            serviceChannel.setDescription("Channel for Adhan Alarm");
            serviceChannel.setSound(null, null); // Sound handled by MediaPlayer
            serviceChannel.enableVibration(true);
            serviceChannel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mediaPlayer != null) {
            mediaPlayer.release();
            mediaPlayer = null;
        }
    }
    private void startFadeIn(int targetStreamVolume, int maxStreamVolume) {
        // We are already at volume 0.01 relative to stream volume.
        // The stream volume is set to 'targetStreamVolume'.
        // We want to fade the MediaPlayer volume from 0.01 to 1.0 (relative to stream).
        
        fadeInTimer = new Timer();
        fadeInTimer.scheduleAtFixedRate(new TimerTask() {
            float volume = 0.01f;
            @Override
            public void run() {
                if (mediaPlayer == null || !mediaPlayer.isPlaying()) {
                    if (fadeInTimer != null) fadeInTimer.cancel();
                    return;
                }
                
                volume += 0.05f; // Increase by 5% every step
                if (volume >= 1.0f) {
                    volume = 1.0f;
                    if (fadeInTimer != null) fadeInTimer.cancel();
                }
                
                try {
                    if (mediaPlayer != null) {
                         mediaPlayer.setVolume(volume, volume);
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error fading in", e);
                }
            }
        }, 0, 500); // Update every 500ms -> reaches 100% in ~10 seconds
    }
}
