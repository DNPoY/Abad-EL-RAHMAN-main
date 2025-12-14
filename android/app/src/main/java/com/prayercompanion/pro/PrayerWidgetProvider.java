package com.prayercompanion.pro;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import com.prayercompanion.pro.R;

public class PrayerWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Retrieve data from SharedPreferences
        SharedPreferences prefs = context.getSharedPreferences("PrayerWidgetPrefs", Context.MODE_PRIVATE);
        String fajr = prefs.getString("fajr", "--:--");
        String dhuhr = prefs.getString("dhuhr", "--:--");
        String asr = prefs.getString("asr", "--:--");
        String maghrib = prefs.getString("maghrib", "--:--");
        String isha = prefs.getString("isha", "--:--");

        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget);
        views.setTextViewText(R.id.widget_fajr_time, fajr);
        views.setTextViewText(R.id.widget_dhuhr_time, dhuhr);
        views.setTextViewText(R.id.widget_asr_time, asr);
        views.setTextViewText(R.id.widget_maghrib_time, maghrib);
        views.setTextViewText(R.id.widget_isha_time, isha);

        // Create an Intent to launch MainActivity when clicked
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_fajr_time, pendingIntent); // Make clickable
        // Can make the whole widget clickable by setting it on the root layout if it had an ID, or individual items.
        // For now, let's just ensure at least one element is clickable or rely on default behavior if any.
        // Actually, let's just set it on the times.

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}
