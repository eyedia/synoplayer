const api_images = window.location.protocol + "//" + window.location.host + "/api/viewer";
const photo_url = window.location.protocol + "//" + window.location.host + "/api/viewer/next";
//const photo_url = "http://127.0.0.1:8080/api/viewer/next";

const html_img01 = document.getElementById("img01");
const html_img02 = document.getElementById("img02");
const html_title = document.querySelector(".intro h2");
const html_sub_title = document.querySelector(".intro h3");
const html_sub_title_2 = document.querySelector(".intro p");
const days_of_week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


setTimeout(function(){
  window.location.reload(1);
}, 10000);

async function get_photo() {
  const response = await fetch(photo_url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const blob = await response.blob();
  return [URL.createObjectURL(blob), response.headers];
}

get_photo()
  .then(object_url_and_headers => {
    html_img01.src = object_url_and_headers[0];
    photo_data_obj = JSON.parse(JSON.stringify(object_url_and_headers[1].get("Photo-Data")));
    let photo_data = JSON.parse(photo_data_obj);
    set_image_attributes(photo_data);

    html_img01.style.opacity = 0; 
    html_img01.style.transition = 'opacity 0.5s ease-in-out';    
    
    html_img01.onload = () => {
      html_img01.style.opacity = 1; 
    };
  })
  .catch(error => {
    console.error('Error fetching image:', error);
  });


function set_image_attributes(photo_data) {
  set_title(photo_data);
  set_sub_title(photo_data);
  set_sub_title_2(photo_data);
  set_orientation(photo_data);
}

function set_orientation(photo_data) {
  let orientation = photo_data.orientation;
  if ((orientation == 6) || (orientation == 8)) {
    html_sub_title_2.textContent = html_sub_title_2.textContent + " rotated|" + html_img01.id;
    html_img01.style.rotate = "360deg";
  } else {
    html_img01.style.removeProperty("rotate");
    html_sub_title_2.textContent = html_sub_title_2.textContent + " not rotated|" + html_img01.id;
  }
}

function set_title(photo_data) {
  try {
    // x = JSON.parse(photo_data);
    // console.log(x);
    let title = photo_data.folder_name;
    console.log(photo_data);
    title = title.split("/").pop(); //removing slash and taking last folder name. i.e. album name
    title = title.replace(" - ", " ");
    title = title.replace("-", " ");
    title = title.replace("-", " ");
    title = title.replace("_", " ");
    title = title.replace("_", " ");
    html_title.textContent = title;

  } catch (error) {
    console.error(error);
    html_title.textContent = "Memories"
  }
}

/*
{
      "id": 3435,
      "photo_id": 20962,
      "filename": "IMG_20181204_183842.jpg",
      "folder_id": 467,
      "folder_name": "/Family/2018/Dyuman Violine",
      "time": 1543948722,
      "type": "photo",
      "orientation": 1,
      "cache_key": "20962_1734859345",
      "unit_id": 20962,
      "geocoding_id": 22,
      "tags": "",
      "address": "{\"country\":\"United States\",\"country_id\":\"United States\",\"state\":\"North Carolina\",\"state_id\":\"North Carolina\",\"county\":\"Mecklenburg County\",\"county_id\":\"Mecklenburg County\",\"city\":\"\",\"city_id\":\"\",\"town\":\"Matthews\",\"town_id\":\"Matthews\",\"district\":\"\",\"district_id\":\"\",\"village\":\"\",\"village_id\":\"\",\"route\":\"Sam Newell Road\",\"route_id\":\"Sam Newell Road\",\"landmark\":\"\",\"landmark_id\":\"\"}",
      "created_at": "2025-01-16 03:44:18"
  }
*/
function set_sub_title(photo_data) {
  try {
    let taken_on = new Date(photo_data.time * 1000);
    taken_on = `${days_of_week[taken_on.getDay()]} ${months[taken_on.getMonth()]} ${taken_on.getDate().toString().padStart(2, 0)} ${taken_on.getFullYear()}`;
    html_sub_title.textContent = taken_on;

    let address = "";
    try {
      let city_or_town = "";
      if (photo_data.address.city != "") { //city priority = low
        city_or_town = photo_data.address.city;
      }

      if (photo_data.address.town != "") { //town priority = high
        city_or_town = photo_data.address.town;
      }

      address = `${city_or_town}, ${photo_data.address.country}`;
      html_sub_title.textContent = html_sub_title.textContent + " | " + address;
    } catch {

    }
    
  } catch (error) {
    console.error(error);
    html_sub_title.textContent = "It's all about the journey"
  }
}

function set_sub_title_2(photo_data) {
  try {
    html_sub_title_2.textContent = photo_data.filename + "|" + photo_data.orientation;
    html_sub_title_2.textContent = html_sub_title_2.textContent + " | + " + JSON.stringify(photo_data.address);
  } catch (error) {
    console.error(error);
    html_sub_title.textContent = "It's all about the journey"
  }
}
