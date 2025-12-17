package com.prayercompanion.pro;

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
import android.util.Log;

import androidx.core.app.NotificationCompat;

import java.io.IOException;

public class AdhanService extends Service {
    private static final String TAG = "AdhanService";
    private static final String CHANNEL_ID = "adhan_channel";
    private MediaPlayer mediaPlayer;

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

        // Max Volume enforcement
        AudioManager audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (audioManager != null) {
            try {
                int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM);
                audioManager.setStreamVolume(AudioManager.STREAM_ALARM, maxVolume, 0);
                Log.d(TAG, "Adhan volume set to max: " + maxVolume);
            } catch (Exception e) {
                Log.e(TAG, "Failed to set Adhan volume to max", e);
            }
        }

        mediaPlayer.setOnCompletionListener(mp -> stopAdhan());
        mediaPlayer.setLooping(false);
        mediaPlayer.start();
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
}
