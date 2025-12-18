package com.prayercompanion.pro;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.core.app.NotificationCompat;

public class AlarmService extends Service {
    private static final String TAG = "AlarmService";
    private static final String CHANNEL_ID = "alarm_channel";
    private MediaPlayer mediaPlayer;
    private int originalVolume = -1;
    private AudioManager audioManager;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;

        String action = intent.getAction();
        if ("STOP_ALARM".equals(action)) {
            stopAlarm();
            return START_NOT_STICKY;
        }

        String soundName = intent.getStringExtra("soundName");
        startForeground(2, createNotification()); // ID 2 for Alarm
        playAlarmSound(soundName);

        // Launch the App Activity on top
        Intent activityIntent = new Intent(this, MainActivity.class);
        activityIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        activityIntent.putExtra("trigger", "alarm"); // Let React know it was an alarm
        startActivity(activityIntent);

        return START_STICKY;
    }

    private void playAlarmSound(String soundName) {
        if (mediaPlayer != null) {
            mediaPlayer.release();
        }

        Uri soundUri = null;
        if (soundName != null && !soundName.equals("default")) {
             // Check for custom ringtone first
             if (soundName.equals("custom")) {
                 SharedPreferences prefs = getSharedPreferences("AlarmPrefs", Context.MODE_PRIVATE);
                 String customUri = prefs.getString("customRingtoneUri", null);
                 if (customUri != null) {
                     soundUri = Uri.parse(customUri);
                 }
             } else {
                 // Map sound names to raw resources
                 int resId = 0;
                 if (soundName.equals("makkah")) resId = R.raw.adhan_makkah;
                 else if (soundName.equals("madinah")) resId = R.raw.adhan_madinah;
                 else if (soundName.equals("egypt")) resId = R.raw.adhan_egypt;
                 
                 if (resId != 0) {
                     soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + resId);
                 }
             }
        }

        // Use default if no specific sound or "default" selected
        if (soundUri == null) {
            soundUri = android.provider.Settings.System.DEFAULT_ALARM_ALERT_URI;
            if (soundUri == null) soundUri = android.provider.Settings.System.DEFAULT_NOTIFICATION_URI;
            if (soundUri == null) soundUri = android.provider.Settings.System.DEFAULT_RINGTONE_URI;
        }

        // Max Volume enforcement with save/restore
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        if (audioManager != null) {
            try {
                // Save original volume to restore later
                originalVolume = audioManager.getStreamVolume(AudioManager.STREAM_ALARM);
                int maxVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM);
                audioManager.setStreamVolume(AudioManager.STREAM_ALARM, maxVolume, 0);
                Log.d(TAG, "Alarm volume set to max: " + maxVolume + " (original was: " + originalVolume + ")");
            } catch (Exception e) {
                Log.e(TAG, "Failed to set Alarm volume to max", e);
            }
        }

        mediaPlayer = new MediaPlayer();
        try {
            mediaPlayer.setDataSource(this, soundUri);
            
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

            mediaPlayer.setLooping(true);
            mediaPlayer.prepare();
            mediaPlayer.start();
        } catch (Exception e) {
            Log.e(TAG, "Error playing alarm sound", e);
        }
    }

    private void stopAlarm() {
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
        
        // Restore original volume after alarm stops
        if (originalVolume != -1 && audioManager != null) {
            try {
                audioManager.setStreamVolume(AudioManager.STREAM_ALARM, originalVolume, 0);
                Log.d(TAG, "Restored original volume to: " + originalVolume);
            } catch (Exception e) {
                Log.e(TAG, "Failed to restore original volume", e);
            }
            originalVolume = -1;
        }
        
        stopForeground(true);
        stopSelf();
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        notificationIntent.putExtra("trigger", "alarm");
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        Intent stopIntent = new Intent(this, AlarmService.class);
        stopIntent.setAction("STOP_ALARM");
        PendingIntent stopPendingIntent = PendingIntent.getService(this, 0, stopIntent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // Full Screen Intent
        Intent fullScreenIntent = new Intent(this, MainActivity.class);
        fullScreenIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        fullScreenIntent.putExtra("trigger", "alarm");
        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(this, 0, fullScreenIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Alarm")
                .setContentText("Wake up!")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .setContentIntent(pendingIntent)
                .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop", stopPendingIntent)
                .setOngoing(true)
                .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Alarm Service Channel",
                    NotificationManager.IMPORTANCE_HIGH
            );
            serviceChannel.setDescription("Channel for Alarm Clock");
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
