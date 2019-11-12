
var city_list;
var totalCities;

$(function(){
    submitCity();
    obtainJson();
});

function submitCity() {

    // $('body').on('click', '#city_submit', function(e)
    $('#city_submit').click(function(e) {
        e.preventDefault();

        console.log(city_list);

        var city = $('#city_input').val();
        var country = $('#country_input').val();
        var cityID;

        console.log(city);
        console.log(country);

        //set cityID of the city the user searched for, by finding user input in the history.city.list.json file aka city_list variable
        for(let i = 0; i < totalCities; i++){
            if((city_list[i]['city']['name'] === city) && (city_list[i]['city']['country'] === country)){
                cityID = parseInt(city_list[i]['city']['id']['$numberLong']);
            }
        }
        console.log(cityID);
        //checkbox checked, send query for hourly weather
        if($('#check_box').is(':checked')){
            $.ajax({
                cache:false,
                url: '/submitCity',
                type: "GET",
                dataType: "text",
                success: function(res){
                     //console.log("first ajax result for hourly: " + res);
                    //res is the api key
                    $.ajax({
                        cache:false,
                        url:"https://api.openweathermap.org/data/2.5/forecast?id="+cityID+res,
                        type: "GET",
                        dataType: "json",
                        success: function(res){
                            cleanDisplay();
                             //console.log("second ajax result for hourly: " + res);
                            var resLength = res['list'].length;
                            var currentDate;

                            for(let i=0; i < resLength; i++){
                                //dt is the time of data forecasted
                                let weather = res['list'][i];
                                let date = new Date((weather['dt']) * 1000);

                                if(currentDate == null){
                                    currentDate = date.getDate();
                                    setDateRow(weather);
                                }
                                if(currentDate != date.getDate()){
                                    currentDate = date.getDate();
                                    setDateRow(weather);
                                }
                                setWeatherCell(weather);

                            }
                        }
                    })
                },
                error: function(err) {
                    alert("No such city found");
                    console.log("MainPage.js::GET error::", err);
                }
            })
        }else{
            //checkbox unchecked, send query for current weather
            $.ajax({
                cache:false,
                url: "/submitCity",
                type: "GET",
                dataType: "text",
                success: function(res){
                     console.log("first ajax result for current: " + res);
                    $.ajax({
                        cache:false,
                        url: "https://api.openweathermap.org/data/2.5/weather?id="+cityID+res,
                        type: "GET",
                        dataType: "json",
                        success: function(res){
                             //console.log("second ajax result for current: " );
                             //console.log(res);
                            cleanDisplay();
                            let day = new Date((res['dt']) * 1000);

                            let currentWeather = document.getElementById('current_id');

                            let locationInfo = setupTags("div","location_info");
                            currentWeather.appendChild(locationInfo);

                            let currentLocation = setupTags("div","current_location", res['name'] +
                                ", " + res['sys']['country']);
                            locationInfo.appendChild(currentLocation);

                            let locationTime = setupTags("div", "location_time", getDay(day) + ", " +
                                (day.getHours()) + (":" + day.getMinutes()));
                            locationInfo.appendChild(locationTime);

                            let weatherDesc = setupTags("div","weather_desc", res['weather']['0']['description']);
                            locationInfo.appendChild(weatherDesc);

                            let current_icon = setupTags("img", "current_icon",
                                getWeatherIcon(res['weather']['0']['main']));
                            locationInfo.appendChild(current_icon);

                            let current_temp = setupTags("span", "current_temp",
                                Math.round((res['main']['temp'] - 273.15) * 10) / 10 + "");
                            locationInfo.appendChild(current_temp);

                            let current_celsius = setupTags("span", "current_celsius", "°C");
                            locationInfo.appendChild(current_celsius);

                            //!!!!!
                            let current_temp_info = setupTags("div", "current_temp_info");
                            locationInfo.appendChild(current_temp_info);

                            let current_wind = setupTags("div", "current_wind", "Wind: "
                                + res['wind']['speed'] + " meter/sec");
                            current_temp_info.appendChild(current_wind);

                            let current_humidity = setupTags("div", "current_humidity",
                                "Humidity: " + res['main']['humidity'] + "%" );
                            current_temp_info.appendChild(current_humidity);
                        }
                    })
                },
                error: function(err){
                    alert("No such city found");
                    console.log("MainPage.js::GET error::", err);
                }
            });
        }
    })
}
//setting up the history.city.list.json file into city_list variable
function obtainJson(){
     $.getJSON('history.city.list.json',function(data){
        city_list = data;
        totalCities = city_list.length;
    }).done(function(){
        console.log("Success: Retrieved JSON data")
    }).fail(function (){
        console.log("Error: Could not retrieve JSON data");
    });

}
//setup a new row in the table
function setDateRow(weather){

    let day = new Date((weather['dt']) * 1000);
    let tableRef = document.getElementById('table_id');

    if(typeof day != 'object'){
        console.log("Error: Given parameter is not an object type(date object)");
    }


    let newRow = tableRef.insertRow(-1);
    newRow.className = 'weather_row_date';

    let dateCell = newRow.insertCell(0);
    dateCell.className = 'weather_cell_date';
    dateCell.colSpan = 2;
    dateCell.textContent = getDay(day) + " " + getMonth(day) +
        " " + day.getDate() + " " + day.getFullYear();
}
//setup new cell in the row in the table
function setWeatherCell(weather){
    console.log(typeof weather['weather']);
    let tableRef = document.getElementById('table_id');
    let day = new Date((weather['dt']) * 1000);

    let newRow = tableRef.insertRow(-1);
    newRow.className = 'weather_row';

    //creation of a timeCell, stating the hour
    let timeCell = newRow.insertCell(0);
    timeCell.className = 'weather_cell_time';
    //getting the leading zero when needed
    timeCell.innerText = ("0" + day.getHours()).slice(-2) + ":0" + day.getMinutes() + ":0" + day.getSeconds();

    //creation of the weatherIcon
    let weatherIcon = setupTags("img", "weather_cell_img",getWeatherIcon(weather['weather']['0']['main']));
    timeCell.appendChild(weatherIcon);


    let infoCell = newRow.insertCell(1);
    infoCell.className = 'weather_cell_info';

    //creation of the hourTemp, stating the temperature
    let hourTemp = setupTags("span","weather_cell_temp",
        Math.round((weather['main']['temp'] - 273.15) * 10) / 10 +"°C");
    let whiteSpace = document.createTextNode("                         ");
    infoCell.appendChild(hourTemp);
    infoCell.appendChild(whiteSpace);

    //creation of the cloudDesc, stating the cloud description
    let cloudDesc = setupTags("i", "weather_cell_cloud", weather['weather'][0]['description']);
    infoCell.appendChild(cloudDesc);

    //creation of the wind_humidity, stating the wind speed and humidity
    let wind_humidity = setupTags("p", "weather_cell_wind_humidity",
        "Wind Speed: " + weather['wind']['speed'] + " meter/sec, Humidity: "
        + weather['main']['humidity'] + "%");
    infoCell.appendChild(wind_humidity);

    //Use of textContent would prevent the above innerText from appearing with the italics
    // infoCell.textContent =
    //     (Math.round((weather['main']['temp'] - 273.15) * 10) / 10) +"°C" + " " + (weather['weather'][0]['description']);
}

function getWeatherIcon(desc){
    let iconList = {
        'Clear': '../assets/01d.png',
        'Clouds': '../assets/03n.png',
        'Drizzle': '../assets/09n.png',
        'Rain': '../assets/09n.png',
        'Thunderstorm':'../assets/11n.png',
        'Snow': '../assets/13n.png',
        'Mist': '../assets/50n.png'};

    return iconList[desc];
}
//setup dom elements in front end
function setupTags(tag,name, text){
    let doc = document.createElement(tag);
    doc.className = name;

    if(tag == 'img'){
        doc.src = text;
    }
    if(text != null && tag != 'img'){
        doc.innerText = text;
    }

    return doc;
}

function cleanDisplay(){
    let tableRef = document.getElementById('table_id');

    if(tableRef.rows.length != 0){
        $("#table_id").empty();
    }

    if(!$('#current_id').is(':empty')){
        $('#current_id').empty();
    }
}

function getDay(day){
    let dateName = {
        '0': "Sunday",
        '1': "Monday",
        '2': "Tuesday",
        '3': "Wednesday",
        '4': "Thursday",
        '5': "Friday",
        '6': "Saturday"};
    return dateName[day.getDay().toString()];
}

function getMonth(day){
    let monthName = {
        '0': "January",
        '1': "February",
        '2': "March",
        '3': "April",
        '4': "May",
        '5': "June",
        '6': "July",
        '7': "August",
        '8': "September",
        '9': "October",
        '10': "November",
        '11': "December"};
    return monthName[day.getMonth().toString()];
}