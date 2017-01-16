// This section sets up some basic app metadata,
// the entire section is optional.
App.info({
    id: 'com.frauas.dateyourprof',
    name: 'DateYourProf',
    description: 'Schedule meetings and consultation hours with your prof.',
    author: 'The DateYourProf-Team',
    email: 'contact@example.com',
    website: 'http://example.com'
});
// Set up resources such as icons and launch screens.
App.icons({
    'android_mdpi': "public/images/fa-calendar.png", // (48x48)
    'android_hdpi': "public/images/fa-calendar.png", //(72x72)
    'android_xhdpi': "public/images/fa-calendar.png", //(96x96)
    'android_xxhdpi': "public/images/fa-calendar.png", //(144x144)
    'android_xxxhdpi': "public/images/fa-calendar.png"//(192x192)
});
// TODO: replace with a bg_slider or sth. in correct resolutions
App.launchScreens({
    'android_mdpi_portrait': "public/images/fa-calendar.png",//(320x470)
    'android_mdpi_landscape': "public/images/fa-calendar.png",//(470x320)
    'android_hdpi_portrait': "public/images/fa-calendar.png",//(480x640)
    'android_hdpi_landscape': "public/images/fa-calendar.png",//(640x480)
    'android_xhdpi_portrait': "public/images/fa-calendar.png",//(720x960)
    'android_xhdpi_landscape': "public/images/fa-calendar.png",//(960x720)
    'android_xxhdpi_portrait': "public/images/fa-calendar.png",//(1080x1440)
    'android_xxhdpi_landscape': "public/images/fa-calendar.png"//(1440x1080)
});
// Set PhoneGap/Cordova preferences
App.setPreference('BackgroundColor', '0xff0000ff');
App.setPreference('HideKeyboardFormAccessoryBar', true);
App.setPreference('Orientation', 'default');