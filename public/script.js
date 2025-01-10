const api_images = window.location.protocol + "//" + window.location.host + "/images";
const html_imgs = document.querySelectorAll(".intro-slideshow img");
let images = [];
let img_counter = 0;
let toggle_image = 0;

get_images(start_slide_show);

function get_images(callback) {
  console.log("calling", api_images);
  fetch(api_images)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      callback(data);
    })
    .catch(error => {
      console.error("Error:" + error);
    });
}

function start_slide_show(imgs) {
  images = imgs;
  html_imgs[0].src = `https://images.pexels.com/photos/${images[img_counter]}?auto=compress&cs=tinysrgb&w=600`;
  html_imgs[0].src = `https://images.pexels.com/photos/${images[img_counter + 1]}?auto=compress&cs=tinysrgb&w=600`;
  html_imgs[0].style.opacity = 1;
  setInterval(next_slide, 5000);
}

function next_slide() {
  html_imgs[0].style.opacity = toggle_image === 0 ? 0 : 1;
  html_imgs[1].style.opacity = toggle_image === 0 ? 1 : 0;

  step_counter();
  html_imgs[0].src = `https://images.pexels.com/photos/${images[img_counter]}?auto=compress&cs=tinysrgb&w=600`;

  step_counter();
  html_imgs[1].src = `https://images.pexels.com/photos/${images[img_counter]}?auto=compress&cs=tinysrgb&w=600`;

  //track_image_view();

  toggle_image = toggle_image === 0 ? 1 : 0;
}

function step_counter() {
  img_counter = img_counter + 1
  if (img_counter >= images.length) {
    img_counter = 0;
  }
}

function track_image_view() {
  fetch("http://127.0.0.1/api/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "id": 1009
    })
  })
    .then(response => response.json())
    .then(data => console.log("Success:", data))
    .catch(error => console.error("Error", error));
}