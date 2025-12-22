package com.ibadalrahman.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.util.Log;
import java.util.Map;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) || 
            "android.intent.action.QUICKBOOT_POWERON".equals(intent.getAction())) {
            
            Log.d(TAG, "Boot completed, rescheduling alarms...");
            rescheduleAlarms(context);
        }
    }

    private void rescheduleAlarms(Context context) {
        SharedPreferences prefs = context.getSharedPreferences("AdhanAlarms", Context.MODE_PRIVATE);
        Map<String, ?> allEntries = prefs.getAll();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        for (Map.Entry<String, ?> entry : allEntries.entrySet()) {
            String key = entry.getKey();
            if (key.startsWith("time_")) {
                try {
                    String prayerName = key.substring(5); // remove "time_"
                    Long timestamp = (Long) entry.getValue();
                    String soundName = prefs.getString("sound_" + prayerName, "adhan_makkah");

                    if (timestamp > System.currentTimeMillis()) {
                        Log.d(TAG, "Rescheduling " + prayerName + " at " + timestamp);
                        
                        Intent alarmIntent = new Intent(context, AdhanReceiver.class);
                        alarmIntent.putExtra("prayerName", prayerName);
                        alarmIntent.putExtra("soundName", soundName);

                        int notificationId = prayerName.hashCode();
                        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                                context,
                                notificationId,
                                alarmIntent,
                                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                        );

                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                            AlarmManager.AlarmClockInfo alarmClockInfo = new AlarmManager.AlarmClockInfo(timestamp, pendingIntent);
                            alarmManager.setAlarmClock(alarmClockInfo, pendingIntent);
                        } else {
                            alarmManager.setExact(AlarmManager.RTC_WAKEUP, timestamp, pendingIntent);
                        }
                    } else {
                        // Cleanup old alarms
                         // prefs.edit().remove(key).remove("sound_" + prayerName).apply(); 
                         // Optional: clean up, but risky if time is slightly sync-off. Better leave it for new schedules to overwrite.
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error rescheduling alarm for " + key, e);
                }
            }
        }
    }
}
