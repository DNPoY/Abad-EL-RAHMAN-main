package com.prayercompanion.pro;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

public class AdhanReceiver extends BroadcastReceiver {
    private static final String TAG = "AdhanReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        String prayerName = intent.getStringExtra("prayerName");
        String soundName = intent.getStringExtra("soundName");
        Log.d(TAG, "Adhan received for: " + prayerName);

        Intent serviceIntent = new Intent(context, AdhanService.class);
        serviceIntent.putExtra("prayerName", prayerName);
        serviceIntent.putExtra("soundName", soundName);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
    }
}
