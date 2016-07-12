var keyring = require('keyring');
var request = require('request');
var sys = require('util')
var exec = require('child_process').exec;
var fs = require("fs");
var moment = require("moment")

var keyringApi = keyring.instance().load();

var makerkey = ''
var iftttTempChangeEvent = 'http://maker.ifttt.com/trigger/{event}/with/key/{makerkey}'
var makerkey = keyringApi.retrieve('tempchange.makerkey')
var forecastio = 'https://api.forecast.io/forecast/{forecastiokey}/{loc}'
var loc = keyringApi.retrieve('tempchange.loc')
var forecastiokey = keyringApi.retrieve('tempchange.forecastiokey')
if(forecastiokey)
{
	forecastio = forecastio.replace('{forecastiokey}',forecastiokey).replace('{loc}',loc)
	console.log(forecastio);
}
var waittime = 120; // Seconds between readings

console.log('starting');		
//Before running the example, retrieve your maker key from and then from the command line do the following:
//  keyring store -k tempchange.makerkey -v MAKERKEY


var child;
// executes `pwd`




if (!makerkey || makerkey == '')
{
    console.log('You do not have a Maker Channel key set.')
    console.log('Get your key from https://ifttt.com/maker and then')
    console.log('Execute the following: ')
    //console.log(' node_modules\\keyring\\bin\\keyring store -k tempchange.makerkey -v MAKERKEY')
    console.log(' node_modiles\\.bin\\keyring.cmd store -k tempchange.makerkey -v MAKERKEY')
    return;
}
var onedriveOutputPath = keyringApi.retrieve('tempchange.onedriveOutputPath');
if (!onedriveOutputPath || onedriveOutputPath==''){
	console.log('use keyring to set onedriveOutputPath')
	onedriveOutputPath = process.env["USERPROFILE"] + '\\Onedrive\\'
	console.log("onedrive set to "+onedriveOutputPath)
 }
 fs.writeFile(onedriveOutputPath + 'pooltemp_history.csv','"datetime","temp","diff"\n', function(err){});
/*
var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});
*/
var lastread = new Date()
var lastreadvalue = 0.0;

 function convertToF(cTempVal) {
                var fTempVal = (cTempVal * (9/5)) + 32;
return fTempVal;
 }
	
	var forecast;
	var curcast = '';
	var curcasthead = '';
 var errorCount = 0;
//var execstring = 'type output.json' /* TEST MOE */
 var execstring = 'rtl_433.exe -F json -T 90 -q '
 var execstringOneDrive = 'rtl_433.exe -F csv -T 90 -q '
var lastReportedHour = 0;
//var onedriveOutputPath = "c:\\users\\kathleen\\onedrive\\pooltemp.csv";

function getForecastFirst()
{
	if(forecastiokey)	
	{
		 request({method:'GET',
                        url: forecastio
                    }, function(error, response, body) {
						//console.log(response);
						forecast = JSON.parse(body).currently
						curcasthead = ('"forecast","outdoortemperature","windspeed","precipIntensity"');
						curcast = ('"' + forecast.summary + '",' + forecast.temperature + ',' + forecast.windSpeed + ',' + forecast.precipIntensity )
						getReading();
//                        console.log(new Date() + ' |--' + convertToF(newval.temperature_C )  + ' (' + change + ')  Reported Hourly.')
                        //console.log('Error was ', error);
                    });

	}
	else{
		getReading();
	}
}

function getReading()
{
   


    child = exec(execstring, function (error, stdout, stderr) {
     /*   if(onedriveOutputPath!='') /* Save out for onedrive.... 
        {
            child = exec(execstringOneDrive + ' > ' + onedriveOutputPath, function (error, stdout, stderr) {
            })}
			*/
			

            
        //sys.print('stdout: ' + stdout);
        var t = stdout.toString().split('\n')
        console.log(t[t.length -2]);
        if(t.length > 0)
        {
            var line = t[t.length - 2];
            if(line.indexOf('{')==0){
                var newval =  JSON.parse(line);	
                var change = convertToF(newval.temperature_C ) - convertToF(lastreadvalue);
                if(lastreadvalue == 0.0)
                {
                    change = 0
                }
                var d = new Date();
				var dateString = moment().format('MM/DD/YYYY, hh:mm:ss');
                if(lastReportedHour!=d.getHours())
                {
                    			if(onedriveOutputPath){
				 fs.appendFile(onedriveOutputPath + 'pooltemp_history.csv','"'+ dateString +'",'+ convertToF(newval.temperature_C) +','+change+',' + curcast + +'\n', function(err){});
				  fs.writeFile(onedriveOutputPath,'"datetime","temp","diff",' + curcasthead + '\n' + 
'"'+ dateString +'",'+ convertToF(newval.temperature_C) +	','+change+',' + curcast + '\n'				  , function(err){});

				
				
			}
                    lastReportedHour = d.getHours();
                    console.log(new Date() + ' ' + convertToF(newval.temperature_C )  + ' (' + change + ')  Reporting Hourly')
                    request({method:'POST',form:{'value1':forecast.temperature + ', ' + forecast.Summary,'value2':convertToF(newval.temperature_C),'value3':change},
                        url: iftttTempChangeEvent.replace('{makerkey}',makerkey).replace('{event}','temp_hourly')
                    }, function(error, response, body) {
                        console.log(new Date() + ' |--' + convertToF(newval.temperature_C )  + ' (' + change + ')  Reported Hourly.')
                        //console.log('Error was ', error);
                    });

                }

                if((Math.abs(change) > 0.4 || lastreadvalue == 0.0) )
                {
                  
                    if(change!=0)
                    {
                        change = Math.round( change * 10 ) / 10;
                    }

                    if(lastreadvalue==0)
                    {
                        change = 'NEW';
                    }else if(Math.abs(change)>5)
                    {
                        change=0;
                    }
                 
                    lastreadvalue = newval.temperature_C;
                    console.log(new Date() + ' ' + convertToF(newval.temperature_C )  + ' (' + change + ')  Reporting')
                 
                    request({method:'POST',form:{'value1':forecast.temperature + ', ' + forecast.Summary,'value2':convertToF(lastreadvalue),'value3':change},
                        url: iftttTempChangeEvent.replace('{makerkey}',makerkey).replace('{event}','temp_change')
                    }, function(error, response, body) {
                        console.log( new Date() + ' |--' + convertToF(newval.temperature_C )  + ' (' + change + ')  Reported Change');
                        /*
                        console.log('Body response was ', body);
                        console.log('Error was ', error);*/
                    });
                }
                else
                {
                    console.log(new Date() + ' ' + convertToF(newval.temperature_C )  + ' (' + change + ')')
                }

            }

        }
        else
        {

            console.log('No reading retrieved');
        }
         
        // sys.print('stderr: ' + stderr);
        if (error !== null) {       
            console.log('unknown exec error: ' + error);       
            errorCount++;
            if(errorCount>5)
            {
                console.log('Quit, to many errors.')
                return;
            }
        }

        setTimeout(function(){ getForecastFirst();}, waittime * 1000)

    });

   // console.log('Executed. Now waiting until ' + new Date(Date.now() + (waittime * 1000) ))
    
}

getForecastFirst();

/*
rl.on('line', function(line){
})
*/

