inputs = document.querySelectorAll("input");

let lat = 22.619916909941367;
let lng = 88.35055541044872;

let fromLocation, toLocation;

let allowedPermission = false;

navigator.geolocation.getCurrentPosition((e) => {
    lat = e.coords.latitude;
    lng = e.coords.longitude;
    allowedPermission = true;
});

inputs.forEach((element) => {
    element.addEventListener("input", async (event) => {
        if (element.value == "") {
            console.log("Wwha");

            let x = document.getElementsByClassName("autocomplete-items");

            Array.from(x).forEach((e) => {
                e.remove();
            });
        } else {
            let data = await fetch(
                `https://places.ls.hereapi.com/places/v1/autosuggest?apiKey=ykWuUVoGdx-KpKO4Yj2mIpl-DeLo34_rhPSXQC0Cm_g&at=${lat},${lng}&q=${element.value}&pretty&result_types=address,place`
            );
            data = await data.json();

            console.log(typeof data);
            console.log(data);

            if (element.value != "")
                createAutoComplete(event.target, data.results);
        }
    });
});

function createAutoComplete(ele, arr) {
    let a = document.createElement("div");
    a.setAttribute("id", ele.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");

    ele.parentNode.appendChild(a);

    if (allowedPermission) {
        let myLocation = document.createElement("DIV");
        myLocation.innerHTML = "Your current Location";
        myLocation.style.fontWeight = "200";
        myLocation.innerHTML += `<input type='hidden' value='${lat}, ${lng}'>`;

        myLocation.addEventListener("click", function (e) {
            ele.value = this.getElementsByTagName("input")[0].value;
            closeAllLists();
            if (ele.id == "startPlace")
                fromLocation = ele.value.replaceAll(" ", "");
            else if (ele.id == "endPlace")
                toLocation = ele.value.replaceAll(" ", "");
        });

        a.appendChild(myLocation);
    }

    if (arr.length === 0) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            x[i].parentElement.removeChild(x[i]);
        }
        return;
    }

    for (let i = 0; i < arr.length; i++) {
        if (!arr[i].position) continue;

        let inputVal = arr[i].title;
        inputVal += arr[i].vicinity ? ", " + arr[i].vicinity : "";

        let b = document.createElement("DIV");
        b.innerHTML = arr[i].highlightedTitle + ", " + arr[i].vicinity;
        b.innerHTML += `<input type='hidden' value='${inputVal}'>`;
        b.addEventListener("click", function (e) {
            ele.value = this.getElementsByTagName("input")[0].value.replaceAll(
                "<br/>",
                ", "
            );
            closeAllLists();

            if (ele.id == "startPlace") fromLocation = arr[i].position;
            else if (ele.id == "endPlace") toLocation = arr[i].position;
        });
        a.appendChild(b);
    }

    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != ele) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

let radios = document.querySelectorAll(".radio");

radios.forEach((element) => {
    element.onclick = () => {
        Array.from(element.parentElement.children).forEach((child) => {
            child.classList.remove("selected");
        });
        element.classList.add("selected");
    };
});

function clearAll() {
    console.log("hey");
    document.querySelector(".selected").classList.remove("selected");
    inputs.forEach((e) => {
        e.value = "";
        e.innerText = "";
    });

    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
        x[i].parentElement.removeChild(x[i]);
    }
}

function doneMove() {
    let modeSelected = document.querySelector(".selected");

    if (
        fromLocation &&
        toLocation &&
        fromLocation.length > 0 &&
        toLocation.length > 0 &&
        modeSelected != null &&
        modeSelected != undefined
    ) {
        document.body.style.transition = ".25s";
        document.body.style.opacity = "0";
        localStorage.setItem("FromLocation", `${fromLocation}`);
        localStorage.setItem("ToLocation", `${toLocation}`);
        localStorage.setItem("Mode", modeSelected.id);

        console.log(localStorage);

        setTimeout(() => {
            let link = document.createElement("a");
            link.href = "../map_page/index.html";
            link.click();
        }, 500);
    }
}
