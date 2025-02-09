const days_of_week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const photo_url = window.location.protocol + "//" + window.location.host + "/api/view";
let refresh_client = 60;

document.addEventListener('DOMContentLoaded', function () {

    //init materialize
    var elems = document.querySelectorAll('.fixed-action-btn');
    let options = {
        direction: 'left',
        hoverEnabled: false,
        toolbarEnabled: false
    }

    var instances = M.FloatingActionButton.init(elems, options);
    var elems_tooltips = document.querySelectorAll('.tooltipped');
    var instances_tooltips = M.Tooltip.init(elems_tooltips, { position: 'top' });    
    top_init();     //this is required to initialize design time urls.

   
    //refresh timer configs from server
    get_config()
        .then(config_from_server => {
            if (config_from_server && config_from_server.refresh_client) {
                refresh_client = config_from_server.refresh_client;
            }
            setInterval(function () {
                refresh_pic();
            }, refresh_client * 1000);
        })
        .catch(err => {
            console.log(err);
        });


});

async function get_config() {
    return fetch(photo_url + "/config")
        .then(response => response.json())
        .then(data => {
            return data;
        });
}


function refresh_pic() {

    var total = 12;
    var count = 0;

    let e_viewer = document.getElementById("viewer");
    if (e_viewer)
        e_viewer.remove();

    let e_toggles = document.getElementsByClassName("toggle");
    if (e_toggles) {
        for (t = 0; t < e_toggles.length; t++) {
            e_toggles[t].remove();
        }

    }

    for (i = 0; i < total; i++) {
        (function (foo) {
            get_photo(foo).then(object_url_and_headers => {
                
                const photo_data = JSON.parse(object_url_and_headers[1].get("Photo-Data"));

                if (photo_data) {
                    let id_suffix = String(photo_data.photo_index).padStart(2, '0');
                    const e_article = document.getElementById('article-' + id_suffix);

                    let e_img = document.getElementById("img-" + id_suffix);
                    e_img.setAttribute("src", object_url_and_headers[0]);
                    e_img.setAttribute("title", photo_data.filename);
                    e_img.setAttribute("orientation", photo_data.orientation);

                    let e_a = document.getElementById("a-" + id_suffix);
                    e_a.setAttribute("href", object_url_and_headers[0]);
                    e_a.setAttribute("orientation", photo_data.orientation);

                    const e_title = document.createElement('h2');
                    e_title.setAttribute("id", `title-${id_suffix}`);                    
                    e_article.appendChild(e_title);

                    const e_sub_title = document.createElement('h3');
                    e_sub_title.setAttribute("id", `sub-title-${id_suffix}}`);
                    e_article.appendChild(e_sub_title);

                    const e_sub_sub_title = document.createElement('p');
                    e_sub_sub_title.setAttribute("id", `sub-sub-title-${id_suffix}}`);
                    e_article.appendChild(e_sub_sub_title);

                    set_image_attributes(photo_data, e_title, e_sub_title, e_sub_sub_title);
                }

                count++;
                if (count > total - 1) {
                    top_init();
                }

            })
                .catch(error => {
                    console.error('Error fetching image:', error);
                });
        }(i));
    }
}


async function get_photo(photo_index) {
    let local_photo_url = photo_url
    if (photo_index) {
        local_photo_url = local_photo_url + `?photo_index=${photo_index}`;
    }
    //console.log(`calling...${local_photo_url}`)
    const response = await fetch(local_photo_url);
    if (!response.ok) {
        //we want to hide the error. I believe Firestick browser like Amazon Silk
        //goes to sleep mode after 'x' times
        //we silently show the logo for this cycle.
        //The actual root cause: At times Synology API returns 404 
        // which could be handled at the server side.
        console.log(`HTTP error! status: ${response.status}`);
        const fake_headers = new Map();
        fake_headers.set('Content-Type', 'image/jpeg');
        const photo_data = {
            "folder_name": "Eyedeea Photos", 
            "photo_index": photo_index,
            "time": Math.floor(Date.now() / 1000)};
        fake_headers.set('Photo-Data', JSON.stringify(photo_data));
        return ["/eyedeea_photos.jpg", fake_headers];
    }
    const blob = await response.blob();
    return [URL.createObjectURL(blob), response.headers];
}


function set_image_attributes(photo_data, e_title, e_sub_title, e_sub_title2) {
    if (photo_data == null) {
        e_title.textContent = "Memories";
        e_sub_title.textContent = "It's all about the journey";
        //html_sub_title_2.textContent = "";
        return;
    }
    set_title(photo_data, e_title);
    set_sub_title(photo_data, e_sub_title);
    set_sub_title_2(photo_data, e_sub_title2);
    //set_orientation(photo_data);
}


function set_title(photo_data, e_title) {
    try {
        let title = photo_data.folder_name;
        title = title.split("/").pop(); //removing slash and taking last folder name. i.e. album name
        title = title.replaceAll(" - ", " ");
        title = title.replaceAll("-", " ");
        title = title.replaceAll("_", " ");
        e_title.textContent = title;

    } catch (error) {
        console.error(error);
        e_title.textContent = "Memories"
    }
}

function set_sub_title(photo_data, e_sub_title) {
    try {
        let taken_on = new Date(photo_data.time * 1000);
        taken_on = `${days_of_week[taken_on.getDay()]} ${months[taken_on.getMonth()]} ${taken_on.getDate().toString().padStart(2, 0)} ${taken_on.getFullYear()}`;
        e_sub_title.textContent = taken_on;

        let address = "";
        try {
            let city_or_town = "";
            if (photo_data.address.city != "") { //city priority = low
                city_or_town = photo_data.address.city;
            }

            if (photo_data.address.town != "") { //town priority = high
                city_or_town = photo_data.address.town;
            }

            if (city_or_town == "") { //if still blank, then county
                city_or_town = photo_data.address.county;
            }

            if (city_or_town == "") { //if still blank, then state
                city_or_town = photo_data.address.state;
            }

            if (city_or_town != "")
                address = `${city_or_town}, ${photo_data.address.country}`;
            else
                address = photo_data.address.country;

            e_sub_title.textContent = html_sub_title.textContent + " | " + address;
        } catch {

        }

    } catch (error) {
        console.error(error);
        e_sub_title.textContent = "It's all about the journey"
    }
}


function set_sub_title_2(photo_data, e_sub_title2) {
    try {
        e_sub_title2.textContent = photo_data.filename;
        //html_sub_title_2.textContent = photo_data.folder_name + "/" + photo_data.filename + "|" + photo_data.orientation;
        //html_sub_title_2.textContent = html_sub_title_2.textContent + " | + " + JSON.stringify(photo_data.address);
    } catch (error) {
        console.error(error);
        e_sub_title2.textContent = "It's all about the journey"
    }
}


function set_orientation(photo_data) {
    let orientation = photo_data.orientation;
    console.log(orientation);
    if ((orientation == 6) || (orientation == 8)) {
        main.slides[main.current].$slideImage.css("background-size", "contain");
    } else {
        main.slides[main.current].$slideImage.css("background-size", "cover");
    }
}


function mt_hangle_tool_click(id) {

    switch (id) {
        case "mt_trash_it":
            console.log(id);
            break;
        case "mt_mark_it":
            break;
        case "mt_incorrect_location":
            break;
        case "mt_incorrect_date":
            break;
        case "mt_incorrect_album":
            break;
        case "mt_dont_show":
            mt_dont_show();
            break;
        case "mt_download":
            mt_download();
            break;
    }

    if(id != "mt_download")
        toggle_lighten(document.getElementById(id), "lighten-4");

}

async function mt_dont_show(){
    // console.log(main.slides[main.current].$slideImage);  
    // main.slides[main.current].$slideImage.css("background-size", "contain");
}

async function mt_download(){
    get_photo(main.current).then(object_url_and_headers => {
        if(object_url_and_headers){
            const a = document.createElement("a");
            a.href = object_url_and_headers[0];
            const photo_data = JSON.parse(object_url_and_headers[1].get("Photo-Data"));
            if(photo_data)
                a.download = photo_data.filename;
            else
                a.download = "photo.jpg";

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });
}

function toggle_lighten(element, toggle_color) {
    if (!element.classList.contains(toggle_color)) {
        element.classList.add(toggle_color);
        return true;
    } else {
        element.classList.remove(toggle_color);
        return false;
    }
}