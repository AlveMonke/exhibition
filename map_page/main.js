let platform = new H.service.Platform({
    apikey: "ykWuUVoGdx-KpKO4Yj2mIpl-DeLo34_rhPSXQC0Cm_g",
});

let routeResult;

let defaultLayers = platform.createDefaultLayers();

let userLatLong = [52.51477270923461, 13.39846691425174];

if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition((e) => {
        userLatLong = [e.coords.latitude, e.coords.longitude];
    });
else
    alert(
        "Your browser does not support GeoLocation. Try using a different one."
    );

let map = new H.Map(
    document.getElementById("mapContainer"),
    defaultLayers.vector.normal.map,
    {
        center: {
            lat: userLatLong[0],
            lng: userLatLong[1],
        },
        zoom: 13,
        pixelRatio: window.devicePixelRatio || 1,
    }
);

let group = new H.map.Group();

let ui = H.ui.UI.createDefault(map, defaultLayers);
ui.getControl("zoom").setAlignment("top-right");

ui.removeControl("mapsettings");
ui.removeControl("scalebar");

ui.addControl(
    "custom_settings_control",
    new H.ui.MapSettingsControl({
        baseLayers: [
            {
                label: "Normal",
                layer: defaultLayers.vector.normal.map,
            },
            {
                label: "Satellite",
                layer: defaultLayers.raster.satellite.map,
            },
            {
                label: "Terrain",
                layer: defaultLayers.raster.terrain.map,
            },
        ],
    })
);

ui.getControl("custom_settings_control").setAlignment("top-left");

document.querySelector(".H_imprint").remove();

function onResult(result) {
    console.log(result);

    if (result.routes.length) {
        routeResult = result;

        result.routes[0].sections.forEach((section) => {
            let linestring = H.geo.LineString.fromFlexiblePolyline(
                section.polyline
            );

            let poly = H.geo.LineString.fromFlexiblePolyline(
                section.polyline
            ).getLatLngAltArray();

            let actions = section.actions;
            let turnLatLng = [];
            // Add a marker for each maneuver
            for (i = 0; i < actions.length; i += 1) {
                let action = actions[i];
                if (action.action != "turn") continue;

                turnLatLng.push([
                    poly[action.offset * 3],
                    poly[action.offset * 3 + 1],
                    action.direction,
                ]);
            }

            localStorage.setItem("turns", JSON.stringify(turnLatLng));

            console.log(turnLatLng);

            let startMarker = new H.map.Marker(
                section.departure.place.location
            );

            let endMarker = new H.map.Marker(section.arrival.place.location);

            let routeLine = new H.map.Polyline(linestring, {
                style: { strokeColor: "#69bc8a", lineWidth: 3 },
            });

            group.addObjects([routeLine, startMarker, endMarker]);

            map.addObjects([group]);

            map.getViewModel().setLookAtData(
                {
                    bounds: group.getBoundingBox(),
                },
                true
            );
        });
    }
}

let router = platform.getRoutingService(null, 8);
let markCoord = [null, null];

window.addEventListener("resize", () => map.getViewPort().resize());

new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

let modeTransport = localStorage.getItem("Mode");
if (modeTransport == "cycle") modeTransport = "bicycle";
else if (modeTransport == "walk") modeTransport = "pedestrian";

let routingParameters = {
    routingMode: "fast",
    transportMode: modeTransport,
    origin: localStorage.getItem("FromLocation"),
    destination: localStorage.getItem("ToLocation"),
    return: "polyline,turnByTurnActions,actions,instructions,travelSummary",
};

router.calculateRoute(routingParameters, onResult, function (error) {
    alert(error.message);
});

let changeView = document.querySelector("#changeView");

// changeView.onclick = () => {
//     if (!routeResult) return;
//     // localStorage.setItem("routeOutput", JSON.stringify(routeResult));

//     let link = document.createElement("a");
//     link.href = "../ar.html";
//     link.click();
// };
