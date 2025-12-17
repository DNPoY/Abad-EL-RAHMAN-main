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
        String hijriDate = prefs.getString("hijriDate", "--");
        String locationName = prefs.getString("locationName", "--");
        
        String nextPrayerName = prefs.getString("nextPrayerName", ""); 
        // We will use nextPrayerName to decide which one to highlight

        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.prayer_widget);
        
        // Set Texts
        views.setTextViewText(R.id.widget_fajr_time, fajr);
        views.setTextViewText(R.id.widget_dhuhr_time, dhuhr);
        views.setTextViewText(R.id.widget_asr_time, asr);
        views.setTextViewText(R.id.widget_maghrib_time, maghrib);
        views.setTextViewText(R.id.widget_isha_time, isha);
        
        views.setTextViewText(R.id.widget_hijri_date, hijriDate);
        views.setTextViewText(R.id.widget_location_name, locationName);

        // Reset Colors (White default)
        int white = android.graphics.Color.WHITE;
        int gold = 0xFFFFD700; // Gold Color

        views.setTextColor(R.id.widget_fajr_time, white);
        views.setTextColor(R.id.widget_dhuhr_time, white);
        views.setTextColor(R.id.widget_asr_time, white);
        views.setTextColor(R.id.widget_maghrib_time, white);
        views.setTextColor(R.id.widget_isha_time, white);

        // Highlight Next Prayer
        if (nextPrayerName.equals("Fajr") || nextPrayerName.equals("الفجر")) views.setTextColor(R.id.widget_fajr_time, gold);
        if (nextPrayerName.equals("Dhuhr") || nextPrayerName.equals("الظهر")) views.setTextColor(R.id.widget_dhuhr_time, gold);
        if (nextPrayerName.equals("Asr") || nextPrayerName.equals("العصر")) views.setTextColor(R.id.widget_asr_time, gold);
        if (nextPrayerName.equals("Maghrib") || nextPrayerName.equals("المغرب")) views.setTextColor(R.id.widget_maghrib_time, gold);
        if (nextPrayerName.equals("Isha") || nextPrayerName.equals("العشاء")) views.setTextColor(R.id.widget_isha_time, gold);

        // App Launch Intent
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.top_bar, pendingIntent);
        
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
