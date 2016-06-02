*Get rtl_433 (precompiled binary for windows http://cognito.me.uk/computers/rtl_433-windows-binary-32-bit/ )

*Setup SDR# to get your driver configured correctly in Windows ( http://airspy.com/download/ )

* Run ZADIG and configure your RTL device by replacing driver (might be called raw feed, might be called RTL and need to use show all)

Install Node

Set your IFTTT Maker Channel API from command prompt (see instructions in readfrom.js )

Run readfrom.js ( "node readfrom.js" )

Configure IFTTT to do notifications for temp_change and to save to a spreadsheet for that and temp_hour

You can also save to a CSV on onedrive and then use PowerBI tool to get the temp to show on your apple watch.

Tested with http://www.amazon.com/Pellor-Wireless-Floating-Thermometer-Solar/dp/B01AO13F06/ref=sr_1_14?ie=UTF8&qid=1464897052&sr=8-14&keywords=pool+temp+wireless

And with http://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=rtl2832u&rh=i%3Aaps%2Ck%3Artl2832u


![Image Alt](image.png)
