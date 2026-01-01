package com.ibadalrahman.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetPlugin extends Plugin {

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        String fajr = call.getString("fajr");
        String dhuhr = call.getString("dhuhr");
        String asr = call.getString("asr");
        String maghrib = call.getString("maghrib");
        String isha = call.getString("isha");
        String nextPrayerName = call.getString("nextPrayerName");
        String hijriDate = call.getString("hijriDate");
        String locationName = call.getString("locationName");

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        
        if (fajr != null) editor.putString("fajr", fajr);
        if (dhuhr != null) editor.putString("dhuhr", dhuhr);
        if (asr != null) editor.putString("asr", asr);
        if (maghrib != null) editor.putString("maghrib", maghrib);
        if (isha != null) editor.putString("isha", isha);
        if (nextPrayerName != null) editor.putString("nextPrayerName", nextPrayerName);
        if (hijriDate != null) editor.putString("hijriDate", hijriDate);
        if (locationName != null) editor.putString("locationName", locationName);
        
        editor.apply();

        // Trigger widget update
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName thisWidget = new ComponentName(context, PrayerWidgetProvider.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
        
        // Update all widgets
        for (int appWidgetId : appWidgetIds) {
            PrayerWidgetProvider.updateAppWidget(context, appWidgetManager, appWidgetId);
        }

        call.resolve();
    }

    @PluginMethod
    public void openBatterySettings(PluginCall call) {
        try {
            Context context = getContext();
            Intent intent = new Intent();
            intent.setAction(android.provider.Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            // Fallback to application details if specific intent fails or not available
            try {
                Context context = getContext();
                Intent intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(android.net.Uri.parse("package:" + context.getPackageName()));
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
                call.resolve();
            } catch (Exception ex) {
                call.reject("Could not open settings", ex);
            }
        }
    }
    @PluginMethod
    public void scheduleAdhan(PluginCall call) {
        String prayerName = call.getString("prayerName");
        Long timestamp = call.getLong("timestamp"); // Unix timestamp in milliseconds
        String soundName = call.getString("soundName");

        if (prayerName == null || timestamp == null) {
            call.reject("Must provide prayerName and timestamp");
            return;
        }

        try {
            Context context = getContext();
            android.app.AlarmManager alarmManager = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            
            // Check for Exact Alarm Permission (Android 12+)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
                if (!alarmManager.canScheduleExactAlarms()) {
                    System.out.println("WidgetPlugin: Exact Alarm permission denied!");
                    // We should technically request permission here or fall back, but for now log it.
                    // call.reject("Exact alarm permission denied"); // Don't reject, maybe use inexact? No, Azan needs exact.
                }
            }

            Intent intent = new Intent(context, AdhanReceiver.class);
            intent.putExtra("prayerName", prayerName);
            intent.putExtra("soundName", soundName);
            
            // Use a unique ID for each prayer to allow multiple alarms
            int notificationId = prayerName.hashCode();
            
            android.app.PendingIntent pendingIntent = android.app.PendingIntent.getBroadcast(
                    context, 
                    notificationId, 
                    intent, 
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE
            );

            // Save to SharedPreferences for boot restoration
            SharedPreferences prefs = context.getSharedPreferences("AdhanAlarms", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();
            editor.putLong("time_" + prayerName, timestamp);
            editor.putString("sound_" + prayerName, soundName);
            editor.apply();

            System.out.println("WidgetPlugin: Scheduling " + prayerName + " at " + timestamp);

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                // Use setAlarmClock for maximum reliability (like a real alarm clock)
                android.app.AlarmManager.AlarmClockInfo alarmClockInfo = new android.app.AlarmManager.AlarmClockInfo(timestamp, pendingIntent);
                alarmManager.setAlarmClock(alarmClockInfo, pendingIntent);
            } else {
                alarmManager.setExact(android.app.AlarmManager.RTC_WAKEUP, timestamp, pendingIntent);
            }

            call.resolve();
        } catch (SecurityException se) {
             System.err.println("WidgetPlugin: SecurityException: " + se.getMessage());
             call.reject("Security Exception: " + se.getMessage());
        } catch (Exception e) {
             System.err.println("WidgetPlugin: Exception: " + e.getMessage());
             call.reject("Error scheduling alarm: " + e.getMessage());
        }
    }

    @PluginMethod
    public void cancelAdhan(PluginCall call) {
        String prayerName = call.getString("prayerName");
        if (prayerName == null) {
            call.reject("Must provide prayerName");
            return;
        }

        Context context = getContext();
        android.app.AlarmManager alarmManager = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, AdhanReceiver.class);
        
        int notificationId = prayerName.hashCode();
        
        android.app.PendingIntent pendingIntent = android.app.PendingIntent.getBroadcast(
                context, 
                notificationId, 
                intent, 
                android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE
        );

        alarmManager.cancel(pendingIntent);
        
        // Remove from SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences("AdhanAlarms", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.remove("time_" + prayerName);
        editor.remove("sound_" + prayerName);
        editor.apply();

        call.resolve();
    }

    @PluginMethod
    public void scheduleAlarm(PluginCall call) {
        Long timestamp = call.getLong("timestamp");
        String soundName = call.getString("soundName");
        
        if (timestamp == null) {
            call.reject("Must provide timestamp");
            return;
        }

        Context context = getContext();
        android.app.AlarmManager alarmManager = (android.app.AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.putExtra("timestamp", timestamp);
        intent.putExtra("soundName", soundName);

        android.app.PendingIntent pendingIntent = android.app.PendingIntent.getBroadcast(
                context,
                2, // ID for Alarm
                intent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE
        );

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            android.app.AlarmManager.AlarmClockInfo alarmClockInfo = new android.app.AlarmManager.AlarmClockInfo(timestamp, pendingIntent);
            alarmManager.setAlarmClock(alarmClockInfo, pendingIntent);
        } else {
            alarmManager.setExact(android.app.AlarmManager.RTC_WAKEUP, timestamp, pendingIntent);
        }

        call.resolve();
    }

    @PluginMethod
    public void stopAlarm(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, AlarmService.class);
        intent.setAction("STOP_ALARM");
        context.startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void getPendingAlarms(PluginCall call) {
        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("AdhanAlarms", Context.MODE_PRIVATE);
        java.util.Map<String, ?> allEntries = prefs.getAll();
        JSObject ret = new JSObject();
        com.getcapacitor.JSArray alarms = new com.getcapacitor.JSArray();

        for (java.util.Map.Entry<String, ?> entry : allEntries.entrySet()) {
            String key = entry.getKey();
            if (key.startsWith("time_")) {
                try {
                    String prayerName = key.substring(5);
                    Long timestamp = (Long) entry.getValue();
                    String soundName = prefs.getString("sound_" + prayerName, "default");
                    
                    if (timestamp > System.currentTimeMillis()) {
                        JSObject alarm = new JSObject();
                        alarm.put("prayerName", prayerName);
                        alarm.put("timestamp", timestamp);
                        alarm.put("soundName", soundName);
                        alarms.put(alarm);
                    }
                } catch (Exception e) {
                   // ignore
                }
            }
        }
        ret.put("alarms", alarms);
        call.resolve(ret);
    }

    private PluginCall savedRingtoneCall = null;
    private static final int RINGTONE_PICKER_REQUEST = 1001;

    @PluginMethod
    public void pickRingtone(PluginCall call) {
        savedRingtoneCall = call;
        call.setKeepAlive(true);
        
        Intent intent = new Intent(android.media.RingtoneManager.ACTION_RINGTONE_PICKER);
        intent.putExtra(android.media.RingtoneManager.EXTRA_RINGTONE_TYPE, android.media.RingtoneManager.TYPE_ALARM);
        intent.putExtra(android.media.RingtoneManager.EXTRA_RINGTONE_TITLE, "Select Alarm Ringtone");
        intent.putExtra(android.media.RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false);
        intent.putExtra(android.media.RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true);
        
        startActivityForResult(call, intent, "handleRingtoneResult");
    }

    @com.getcapacitor.annotation.ActivityCallback
    private void handleRingtoneResult(PluginCall call, androidx.activity.result.ActivityResult result) {
        if (result.getResultCode() == android.app.Activity.RESULT_OK && result.getData() != null) {
            android.net.Uri uri = result.getData().getParcelableExtra(android.media.RingtoneManager.EXTRA_RINGTONE_PICKED_URI);
            if (uri != null) {
                android.media.Ringtone ringtone = android.media.RingtoneManager.getRingtone(getContext(), uri);
                String title = ringtone != null ? ringtone.getTitle(getContext()) : "Custom Ringtone";
                
                // Save to SharedPreferences
                SharedPreferences prefs = getContext().getSharedPreferences("AlarmPrefs", Context.MODE_PRIVATE);
                prefs.edit()
                    .putString("customRingtoneUri", uri.toString())
                    .putString("customRingtoneTitle", title)
                    .apply();
                
                JSObject ret = new JSObject();
                ret.put("uri", uri.toString());
                ret.put("title", title);
                call.resolve(ret);
            } else {
                call.reject("No ringtone selected");
            }
        } else {
            call.reject("Ringtone picker cancelled");
        }
    }

    @PluginMethod
    public void getCustomRingtone(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences("AlarmPrefs", Context.MODE_PRIVATE);
        String uri = prefs.getString("customRingtoneUri", null);
        String title = prefs.getString("customRingtoneTitle", null);
        
        JSObject ret = new JSObject();
        ret.put("title", title);
        call.resolve(ret);
    }

    @PluginMethod
    public void setAzanVolume(PluginCall call) {
        Integer volume = call.getInt("volume");
        if (volume == null) {
            call.reject("Must provide volume");
            return;
        }

        // Clamp volume between 0 and 100
        if (volume < 0) volume = 0;
        if (volume > 100) volume = 100;

        Context context = getContext();
        SharedPreferences prefs = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        prefs.edit().putInt("azanVolume", volume).apply();

        call.resolve();
    }

    @PluginMethod
    public void setSmartDnd(PluginCall call) {
        Boolean enabled = call.getBoolean("enabled");
        if (enabled == null) {
            call.reject("Must provide enabled");
            return;
        }
        getContext().getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE)
                .edit().putBoolean("smartDnd", enabled).apply();
        call.resolve();
    }

    @PluginMethod
    public void setAzanFadeIn(PluginCall call) {
        Boolean enabled = call.getBoolean("enabled");
        if (enabled == null) {
            call.reject("Must provide enabled");
            return;
        }
        getContext().getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE)
                .edit().putBoolean("azanFadeIn", enabled).apply();
        call.resolve();
    }
}
