"use strict";

// =====================================================
// 1. PAGE DETECTION AND HTML ELEMENTS
// =====================================================

const isDiplomaPage =
    document.body.classList.contains("diploma-page");

const startFloor = document.getElementById("startFloor");
const destinationFloor = document.getElementById("destinationFloor");

const startSelect = document.getElementById("start");
const destinationSelect = document.getElementById("destination");

const navigationMode = document.getElementById("navigationMode");
const setLocationModeButton = document.getElementById("setLocationMode");
const locationStatus = document.getElementById("locationStatus");

const destinationSearch = document.getElementById("destinationSearch");
const destinationSearchResults = document.getElementById("destinationSearchResults");

const findRouteButton = document.getElementById("findRoute");
const clearRouteButton = document.getElementById("clearRoute");
const resetNavigationButton = document.getElementById("resetNavigation");

const message = document.getElementById("message");
const navigation3DSection = document.getElementById("navigation3DSection");
const activeFloorName = document.getElementById("activeFloorName");
const directions = document.getElementById("directions");

const floorOrder = ["ground", "first", "second"];

let userCurrentLocation = null;
let activeNavigation = null;


// =====================================================
// 2. GENERAL HELPERS
// =====================================================

function showMessage(text) {
    if (message) message.textContent = text;
}

function updateLocationStatus(text) {
    if (locationStatus) locationStatus.textContent = text;
}

function getFloorName(floor) {
    return campusFloors[floor]?.name || floor;
}

function clearDirections() {
    if (directions) directions.replaceChildren();
}

function getRoom(floor, id) {
    if (!campusFloors || !campusFloors[floor]) return null;

    return campusFloors[floor].rooms.find(
        room => room.id === id
    ) || null;
}


// =====================================================
// 3. INDOOR NAVIGATION DATA VALIDATION
// =====================================================

if (isDiplomaPage) {

    if (
        typeof campusFloors === "undefined" ||
        typeof staircaseConnections === "undefined"
    ) {
        throw new Error(
            "Floor data missing. Check floor-data.js."
        );
    }

    if (!window.Campus3D) {
        throw new Error(
            "Campus3D engine missing. Check script order."
        );
    }

    if (
        !startFloor ||
        !destinationFloor ||
        !startSelect ||
        !destinationSelect
    ) {
        throw new Error(
            "Diploma navigation HTML elements are missing."
        );
    }
}


// =====================================================
 // 4. LOAD ALL FLOOR ROOMS INTO TWO DROPDOWNS
 // =====================================================

function makeRoomOptionValue(floor, roomId) {
    return `${floor}::${roomId}`;
}

function parseRoomOptionValue(value) {
    if (!value || !value.includes("::")) return null;

    const [floor, ...idParts] = value.split("::");

    return {
        floor,
        id: idParts.join("::")
    };
}

function loadAllRoomLocations(dropdown, placeholder) {
    if (!dropdown) return;

    dropdown.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = placeholder;
    dropdown.appendChild(defaultOption);

    floorOrder.forEach(floor => {
        if (!campusFloors[floor]) return;

        campusFloors[floor].rooms.forEach(room => {
            const option = document.createElement("option");

            option.value = makeRoomOptionValue(floor, room.id);
            option.textContent =
                getFloorName(floor) + " - " + room.name;

            dropdown.appendChild(option);
        });
    });
}

function updateStartingLocations() {
    if (!startFloor || !startSelect) return;

    const selected = parseRoomOptionValue(startSelect.value);

    if (selected) {
        startFloor.value = selected.floor;
    }

    userCurrentLocation = null;
    activeNavigation = null;

    showMessage("");
    updateLocationStatus("Select your starting point.");
}

function updateDestinationLocations() {
    if (!destinationFloor || !destinationSelect) return;

    const selected = parseRoomOptionValue(destinationSelect.value);

    if (selected) {
        destinationFloor.value = selected.floor;
    }

    showMessage("");
}


// Load all rooms in both dropdowns.
if (isDiplomaPage) {
    loadAllRoomLocations(
        startSelect,
        "-- Select Starting Point --"
    );

    loadAllRoomLocations(
        destinationSelect,
        "-- Select Destination --"
    );

    startSelect.addEventListener("change", () => {
        const selected = parseRoomOptionValue(startSelect.value);

        if (selected) {
            startFloor.value = selected.floor;
        }

        userCurrentLocation = null;
        activeNavigation = null;
        showMessage("");
    });

    destinationSelect.addEventListener(
        "change",
        updateDestinationLocations
    );
}

// =====================================================
// 5. DESTINATION SEARCH
// =====================================================

function searchCampusRooms(query) {
    if (!isDiplomaPage || !query.trim()) return [];

    const searchText = query.trim().toLowerCase();
    const results = [];

    floorOrder.forEach(floor => {
        if (!campusFloors[floor]) return;

        campusFloors[floor].rooms.forEach(room => {
            const name = String(room.name || "").toLowerCase();
            const id = String(room.id || "").toLowerCase();

            if (
                name.includes(searchText) ||
                id.includes(searchText)
            ) {
                results.push({ floor, room });
            }
        });
    });

    return results;
}

function clearDestinationSearchResults() {
    if (destinationSearchResults) {
        destinationSearchResults.replaceChildren();
    }
}

function selectSearchResult(floor, room) {
    if (!destinationFloor || !destinationSelect) return;

    destinationFloor.value = floor;

    destinationSelect.value =
        makeRoomOptionValue(floor, room.id);

    if (destinationSearch) {
        destinationSearch.value = room.name;
    }

    clearDestinationSearchResults();

    showMessage("Destination selected: " + room.name);
}

function displayDestinationSearchResults(results) {
    clearDestinationSearchResults();

    if (!destinationSearchResults) return;

    if (results.length === 0) {
        const noResult = document.createElement("p");
        noResult.textContent = "No matching room found.";

        destinationSearchResults.appendChild(noResult);
        return;
    }

    results.slice(0, 10).forEach(result => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "search-result-item";

        button.textContent =
            result.room.name + " - " +
            getFloorName(result.floor);

        button.addEventListener("click", () => {
            selectSearchResult(result.floor, result.room);
        });

        destinationSearchResults.appendChild(button);
    });
}

if (destinationSearch) {
    destinationSearch.addEventListener("input", () => {
        const query = destinationSearch.value.trim();

        if (!query) {
            clearDestinationSearchResults();
            return;
        }

        displayDestinationSearchResults(
            searchCampusRooms(query)
        );
    });
}
// =====================================================
// 6. STAIRCASE CONNECTIONS
// =====================================================

function getConnection(fromFloor, toFloor) {
    return staircaseConnections.find(connection =>
        connection.from.floor === fromFloor &&
        connection.to.floor === toFloor
    ) || staircaseConnections.find(connection =>
        connection.from.floor === toFloor &&
        connection.to.floor === fromFloor
    ) || null;
}

function getConnectionRoom(connection, floor) {
    if (!connection) return null;

    let room = null;

    if (connection.from.floor === floor) {
        room = getRoom(floor, connection.from.id);
    } else if (connection.to.floor === floor) {
        room = getRoom(floor, connection.to.id);
    }

    if (!room) return null;

    if (floor === "first" && room.id === "F-S-S1") {
        return {
            ...room,
            x: -31.5,
            z: -13.5
        };
    }

    return room;
}


// =====================================================
// 7. FLOOR SEQUENCE
// =====================================================

function getFloorSequence(start, destination) {
    const startIndex = floorOrder.indexOf(start);
    const destinationIndex = floorOrder.indexOf(destination);

    if (startIndex < 0 || destinationIndex < 0) {
        return [];
    }

    const step = startIndex <= destinationIndex ? 1 : -1;
    const sequence = [];

    for (
        let i = startIndex;
        step > 0 ? i <= destinationIndex : i >= destinationIndex;
        i += step
    ) {
        sequence.push(floorOrder[i]);
    }

    return sequence;
}


// =====================================================
// 8. CORRIDOR COORDINATES
// =====================================================

const CORRIDORS = {
    ground: {
        leftX: -31.5,
        rightX: 31.5,
        topZ: -13.5,
        bottomZ: 22.5
    },

    first: {
        leftX: -31.5,
        rightX: 31.5,
        topZ: -13.5,
        bottomZ: 22.5
    }
};


// =====================================================
// 9. POINT HELPERS
// =====================================================

function addPoint(points, x, z) {
    const last = points[points.length - 1];

    if (
        !last ||
        Math.abs(last.x - x) > 0.001 ||
        Math.abs(last.z - z) > 0.001
    ) {
        points.push({ x, z });
    }
}

function addOrthogonalPath(points, from, to) {
    addPoint(points, from.x, from.z);
    addPoint(points, to.x, from.z);
    addPoint(points, to.x, to.z);
}

function manhattanDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
}


// =====================================================
// 10. GET ROOM ACCESS POINT
// =====================================================

function getAccessPoint(floor, room) {
    const C = CORRIDORS[floor];

    if (!C) {
        return { x: room.x, z: room.z };
    }

    if (room.id === "G-F-S1") {
        return {
            x: room.x,
            z: C.bottomZ
        };
    }

    if (room.id === "G-F-S2") {
        return {
            x: C.rightX,
            z: room.z
        };
    }

    if (room.id === "F-S-S1") {
        return {
            x: C.leftX,
            z: C.topZ
        };
    }

    if (room.z < C.topZ) {
        return { x: room.x, z: C.topZ };
    }

    if (room.z > C.bottomZ) {
        return { x: room.x, z: C.bottomZ };
    }

    if (room.x < C.leftX) {
        return { x: C.leftX, z: room.z };
    }

    if (room.x > C.rightX) {
        return { x: C.rightX, z: room.z };
    }

    const candidates = [
        { x: room.x, z: C.topZ },
        { x: room.x, z: C.bottomZ },
        { x: C.leftX, z: room.z },
        { x: C.rightX, z: room.z }
    ];

    candidates.sort((a, b) =>
        manhattanDistance(a, room) -
        manhattanDistance(b, room)
    );

    return candidates[0];
}


// =====================================================
// 11. PERIMETER ROUTING
// =====================================================

function perimeterPosition(floor, point) {
    const C = CORRIDORS[floor];

    const width = C.rightX - C.leftX;
    const depth = C.bottomZ - C.topZ;

    if (Math.abs(point.z - C.topZ) < 0.01) {
        return point.x - C.leftX;
    }

    if (Math.abs(point.x - C.rightX) < 0.01) {
        return width + point.z - C.topZ;
    }

    if (Math.abs(point.z - C.bottomZ) < 0.01) {
        return width + depth + C.rightX - point.x;
    }

    if (Math.abs(point.x - C.leftX) < 0.01) {
        return 2 * width + depth + C.bottomZ - point.z;
    }

    return 0;
}

function perimeterPoint(floor, distance) {
    const C = CORRIDORS[floor];

    const width = C.rightX - C.leftX;
    const depth = C.bottomZ - C.topZ;
    const perimeter = 2 * (width + depth);

    let s = ((distance % perimeter) + perimeter) % perimeter;

    if (s <= width) {
        return {
            x: C.leftX + s,
            z: C.topZ
        };
    }

    s -= width;

    if (s <= depth) {
        return {
            x: C.rightX,
            z: C.topZ + s
        };
    }

    s -= depth;

    if (s <= width) {
        return {
            x: C.rightX - s,
            z: C.bottomZ
        };
    }

    s -= width;

    return {
        x: C.leftX,
        z: C.bottomZ - s
    };
}

function buildPerimeterPath(floor, start, end, direction) {
    const C = CORRIDORS[floor];

    const width = C.rightX - C.leftX;
    const depth = C.bottomZ - C.topZ;
    const perimeter = 2 * (width + depth);

    const startS = perimeterPosition(floor, start);
    const endS = perimeterPosition(floor, end);

    const distance = direction === 1
        ? (endS - startS + perimeter) % perimeter
        : (startS - endS + perimeter) % perimeter;

    const corners = [
        0,
        width,
        width + depth,
        2 * width + depth
    ];

    const intermediate = [];

    corners.forEach(corner => {
        const travel = direction === 1
            ? (corner - startS + perimeter) % perimeter
            : (startS - corner + perimeter) % perimeter;

        if (
            travel > 0.001 &&
            travel < distance - 0.001
        ) {
            intermediate.push(travel);
        }
    });

    intermediate.sort((a, b) => a - b);

    const points = [{ x: start.x, z: start.z }];

    intermediate.forEach(travel => {
        const point = perimeterPoint(
            floor,
            startS + direction * travel
        );

        addPoint(points, point.x, point.z);
    });

    addPoint(points, end.x, end.z);

    return points;
}

function getPerimeterRoute(floor, start, end) {
    const clockwise = buildPerimeterPath(
        floor,
        start,
        end,
        1
    );

    const anticlockwise = buildPerimeterPath(
        floor,
        start,
        end,
        -1
    );

    function pathLength(points) {
        let total = 0;

        for (let i = 1; i < points.length; i++) {
            total += manhattanDistance(
                points[i - 1],
                points[i]
            );
        }

        return total;
    }

    return pathLength(clockwise) <= pathLength(anticlockwise)
        ? clockwise
        : anticlockwise;
}


// =====================================================
// 12. FLOOR ROUTE ALGORITHMS
// =====================================================

function getCorridorRoute(floor, startRoom, endRoom) {
    const start = {
        x: startRoom.x,
        z: startRoom.z
    };

    const end = {
        x: endRoom.x,
        z: endRoom.z
    };

    const startAccess = getAccessPoint(floor, startRoom);
    const endAccess = getAccessPoint(floor, endRoom);

    const points = [];

    addPoint(points, start.x, start.z);

    addOrthogonalPath(points, start, startAccess);

    const perimeterRoute = getPerimeterRoute(
        floor,
        startAccess,
        endAccess
    );

    perimeterRoute.forEach(point => {
        addPoint(points, point.x, point.z);
    });

    addOrthogonalPath(points, endAccess, end);

    return points;
}

function getSecondFloorRoute(startRoom, endRoom) {
    const points = [];

    addPoint(points, startRoom.x, startRoom.z);
    addPoint(points, startRoom.x, endRoom.z);
    addPoint(points, endRoom.x, endRoom.z);

    return points;
}

function getRoutePoints(floor, startRoom, endRoom) {
    if (floor === "ground" || floor === "first") {
        return getCorridorRoute(
            floor,
            startRoom,
            endRoom
        );
    }

    return getSecondFloorRoute(
        startRoom,
        endRoom
    );
}


// =====================================================
// 13. DRAW FLOOR ROUTE
// =====================================================

function drawFloorRoute(floor, fromRoom, toRoom) {
    if (typeof Campus3D.drawRoute !== "function") {
        console.error("drawRoute() is unavailable.");
        return false;
    }

    if (
        !Number.isFinite(fromRoom.x) ||
        !Number.isFinite(fromRoom.z) ||
        !Number.isFinite(toRoom.x) ||
        !Number.isFinite(toRoom.z)
    ) {
        console.error("Invalid route coordinates:", {
            fromRoom,
            toRoom
        });

        return false;
    }

    const points = getRoutePoints(
        floor,
        fromRoom,
        toRoom
    );

    console.log("ROUTE DEBUG:", {
        floor,
        from: fromRoom.name,
        to: toRoom.name,
        points
    });

    Campus3D.drawRoute(floor, points);

    return true;
}


// =====================================================
// 14. SHOW NAVIGATION STEP
// =====================================================

function showNavigationStep(
    sequence,
    index,
    startRoom,
    destinationRoom
) {
    if (!Array.isArray(sequence) || sequence.length === 0) {
        showMessage("Invalid floor sequence.");
        return;
    }

    // Show all floors and select the starting floor as active.
    Campus3D.showFloor(sequence[0]);

    if (navigation3DSection) {
        navigation3DSection.hidden = false;
        navigation3DSection.style.display = "block";
    }

    // Remove all previously displayed floor routes.
    Campus3D.clearRoute();

    clearDirections();

    if (activeFloorName) {
        activeFloorName.textContent =
            "Complete Diploma Building - All Floors";
    }

    // Draw route on every floor in the sequence.
    for (let i = 0; i < sequence.length; i++) {

        const floor = sequence[i];

        if (!campusFloors[floor]) {
            showMessage("Invalid floor: " + floor);
            Campus3D.clearRoute();
            return;
        }

        let fromRoom;
        let toRoom;

        // Starting point on the first floor.
        if (i === 0) {
            fromRoom = startRoom;
        } else {
            const previousFloor = sequence[i - 1];

            const connection = getConnection(
                previousFloor,
                floor
            );

            if (!connection) {
                showMessage(
                    "Staircase connection missing between " +
                    getFloorName(previousFloor) +
                    " and " +
                    getFloorName(floor)
                );

                Campus3D.clearRoute();
                return;
            }

            fromRoom = getConnectionRoom(
                connection,
                floor
            );
        }

        // Destination point on the last floor.
        if (i === sequence.length - 1) {
            toRoom = destinationRoom;
        } else {
            const nextFloor = sequence[i + 1];

            const connection = getConnection(
                floor,
                nextFloor
            );

            if (!connection) {
                showMessage(
                    "Staircase connection missing between " +
                    getFloorName(floor) +
                    " and " +
                    getFloorName(nextFloor)
                );

                Campus3D.clearRoute();
                return;
            }

            toRoom = getConnectionRoom(
                connection,
                floor
            );
        }

        if (!fromRoom || !toRoom) {
            showMessage(
                "Could not identify staircase on " +
                getFloorName(floor)
            );

            Campus3D.clearRoute();
            return;
        }

        const routeDrawn = drawFloorRoute(
            floor,
            fromRoom,
            toRoom
        );

        if (!routeDrawn) {
            showMessage(
                "Could not draw route on " +
                getFloorName(floor)
            );

            Campus3D.clearRoute();
            return;
        }

        // Add floor-wise directions.
        if (directions) {

            const heading = document.createElement("h4");
            heading.textContent = getFloorName(floor);

            directions.appendChild(heading);

            const startInstruction = document.createElement("p");

            startInstruction.textContent =
                i === 0
                    ? "Starting point: " + startRoom.name
                    : "Enter this floor through: " + fromRoom.name;

            directions.appendChild(startInstruction);

            const endInstruction = document.createElement("p");

            endInstruction.textContent =
                i === sequence.length - 1
                    ? "Destination: " + destinationRoom.name
                    : "Continue to staircase: " + toRoom.name;

            directions.appendChild(endInstruction);
        }
    }

    showMessage(
        "Complete route displayed from " +
        startRoom.name +
        " to " +
        destinationRoom.name
    );

    console.log("Complete multi-floor navigation:", {
        sequence,
        startRoom,
        destinationRoom
    });
}
// =====================================================
// 15. FIND ROUTE
// =====================================================

function findRoute() {
    if (!isDiplomaPage) return;

    let startRoom;
    let startFloorValue;

    const selectedDestination =
        parseRoomOptionValue(destinationSelect.value);

    if (!selectedDestination) {
        showMessage("Please select a destination.");
        return;
    }

    const destinationFloorValue = selectedDestination.floor;

    const destinationRoom = getRoom(
        destinationFloorValue,
        selectedDestination.id
    );

    if (!destinationRoom) {
        showMessage("Destination room not found.");
        return;
    }

    // CURRENT LOCATION MODE
    if (navigationMode && navigationMode.value === "current") {
        if (!userCurrentLocation) {
            showMessage(
                "Please set your current location on the 3D map first."
            );
            return;
        }

        startRoom = userCurrentLocation;
        startFloorValue = userCurrentLocation.floor;
    }

    // MANUAL ROOM SELECTION MODE
    else {
        const selectedStart =
            parseRoomOptionValue(startSelect.value);

        if (!selectedStart) {
            showMessage("Please select a starting point.");
            return;
        }

        startFloorValue = selectedStart.floor;

        startRoom = getRoom(
            startFloorValue,
            selectedStart.id
        );

        if (!startRoom) {
            showMessage("Starting room not found.");
            return;
        }
    }

    if (
        !Number.isFinite(startRoom.x) ||
        !Number.isFinite(startRoom.z) ||
        !Number.isFinite(destinationRoom.x) ||
        !Number.isFinite(destinationRoom.z)
    ) {
        showMessage("Room coordinates are missing.");
        return;
    }

    const sequence = getFloorSequence(
        startFloorValue,
        destinationFloorValue
    );

    if (!sequence.length) {
        showMessage("Could not create floor navigation.");
        return;
    }

    for (let i = 0; i < sequence.length - 1; i++) {
        const connection = getConnection(
            sequence[i],
            sequence[i + 1]
        );

        if (!connection) {
            showMessage(
                "No staircase connection found between " +
                getFloorName(sequence[i]) +
                " and " +
                getFloorName(sequence[i + 1])
            );
            return;
        }
    }

    activeNavigation = {
        sequence,
        startRoom,
        destinationRoom
    };

    showNavigationStep(
        sequence,
        0,
        startRoom,
        destinationRoom
    );

    console.log("Navigation started:", activeNavigation);
}

// =====================================================
// 16. CLEAR AND RESET NAVIGATION
// =====================================================

function clearRoute() {
    if (
        window.Campus3D &&
        typeof Campus3D.clearRoute === "function"
    ) {
        Campus3D.clearRoute();
    }

    clearDirections();

    activeNavigation = null;

    showMessage("Route cleared.");
}

function resetNavigation() {
    window.location.reload();
}


// =====================================================
// 17. CURRENT LOCATION MODE
// =====================================================

function setLocationMode() {
    if (!navigationMode || navigationMode.value !== "current") {
        updateLocationStatus(
            "Select Current Location mode first."
        );

        return;
    }

    const floor = startFloor.value;

    if (!floor) {
        updateLocationStatus(
            "Select your current floor first."
        );

        return;
    }

    if (
        !window.Campus3D ||
        typeof Campus3D.enableLocationPicking !== "function"
    ) {
        updateLocationStatus(
            "Location picking is unavailable."
        );

        return;
    }

    Campus3D.showFloor(floor);

    updateLocationStatus(
        "Click your approximate current position on the 3D map."
    );

    showMessage(
        "Select your current position on the 3D map."
    );

    Campus3D.enableLocationPicking(function(
        selectedFloor,
        x,
        z
    ) {
        userCurrentLocation = {
            id: "CURRENT-LOCATION",
            name: "Your Current Location",
            floor: selectedFloor,
            x,
            z
        };

        startFloor.value = selectedFloor;

        if (startSelect) {
            startSelect.disabled = true;
        }

        updateLocationStatus(
            "Current location set successfully."
        );

        showMessage(
            "Current location selected. Now select your destination."
        );

        console.log(
            "Current location saved:",
            userCurrentLocation
        );
    });
}


// =====================================================
// 18. NAVIGATION MODE CHANGE
// =====================================================

if (navigationMode) {
    navigationMode.addEventListener("change", () => {
        userCurrentLocation = null;
        activeNavigation = null;

        if (
            window.Campus3D &&
            typeof Campus3D.disableLocationPicking === "function"
        ) {
            Campus3D.disableLocationPicking();
        }

        if (navigationMode.value === "current") {
            if (startSelect) {
                startSelect.disabled = true;
            }

            updateLocationStatus(
                "Select your floor and click Set Location."
            );
        } else {
            if (startSelect) {
                startSelect.disabled = false;
            }

            updateLocationStatus(
                "Select your starting room."
            );
        }

        showMessage("");
        clearDirections();
    });
}


// =====================================================
// 19. INDOOR BUTTON EVENTS
// =====================================================

if (setLocationModeButton) {
    setLocationModeButton.addEventListener(
        "click",
        setLocationMode
    );
}

if (findRouteButton) {
    findRouteButton.addEventListener(
        "click",
        findRoute
    );
}

if (clearRouteButton) {
    clearRouteButton.addEventListener(
        "click",
        clearRoute
    );
}

if (resetNavigationButton) {
    resetNavigationButton.addEventListener(
        "click",
        resetNavigation
    );
}


// =====================================================
// 20. INITIALIZE INDOOR NAVIGATION ONLY ON DIPLOMA PAGE
// =====================================================

function initializeCampusNavigator() {
    if (!isDiplomaPage) return;

    loadAllRoomLocations(
        startSelect,
        "-- Select Starting Point --"
    );

    loadAllRoomLocations(
        destinationSelect,
        "-- Select Destination --"
    );

    if (navigationMode && navigationMode.value === "current") {
        startSelect.disabled = true;
    }

    if (navigation3DSection) {
        navigation3DSection.hidden = false;
    }

    console.log("Diploma Indoor Navigator initialized.");
    console.log("Available floors:", floorOrder);
    console.log("Campus floor data:", campusFloors);
    console.log("Staircase connections:", staircaseConnections);
}

initializeCampusNavigator();


// =====================================================
// 21. V1 CAMPUS NAVIGATION DATA
// =====================================================

const campusLocations = {
    "Main Gate": {
        description: "Main entrance of SVPM College.",
        gps: "4GP2+FC8"
    },

    "Ground": {
        description: "College ground for outdoor activities.",
        gps: "4FPX+PVV"
    },

    "Auditorium": {
        description: "College auditorium for events and programs.",
        gps: "4FPX+PGQ"
    },

    "Girls Hostel": {
        description: "Girls hostel building.",
        gps: "4FPX+M67"
    },

    "Pharmacy": {
        description: "Pharmacy college building.",
        gps: "4FPX+XPH"
    },

    "Diploma": {
        description: "Diploma college building.",
        gps: "4FQX+FM2"
    },

    "Canteen": {
        description: "College canteen for food and refreshments.",
        gps: "4FQX+C9P"
    },

    "Lawn": {
        description: "College lawn and open green space.",
        gps: "4FPX+WXG"
    },

    "Engineering Building A": {
        description: "Engineering college building, Block A.",
        gps: "4FQX+MG7"
    },

    "Engineering Building B": {
        description: "Engineering college building, Block B.",
        gps: "4HRX+43X"
    },

    "Boys Hostel": {
        description: "Boys hostel building.",
        gps: "4FQX+747"
    },

    "Play Ground": {
        description: "College playground for sports and outdoor activities.",
        gps: "4FQX+H7H"
    },

    "SVPM Commerce College": {
        description: "SVPM Commerce College building.",
        gps: "4FRW+8WJ"
    }
};


// =====================================================
// 22. V1 CAMPUS NAVIGATION ELEMENTS
// =====================================================

const campusLocationSelect =
    document.getElementById("campusLocation");

const campusMessage =
    document.getElementById("campusMessage");

const campusDetails =
    document.getElementById("campusDetails");

const campusDetailsButton =
    document.getElementById("campusDetailsButton");

const campusMapButton =
    document.getElementById("campusMapButton");

const campusDirectionsButton =
    document.getElementById("campusDirectionsButton");


function getCampusSelection() {
    if (!campusLocationSelect || !campusMessage) {
        return null;
    }

    const name = campusLocationSelect.value;

    if (!name || !campusLocations[name]) {
        campusMessage.textContent =
            "Please select a destination first.";

        return null;
    }

    campusMessage.textContent = "";

    return {
        name,
        ...campusLocations[name]
    };
}

function getCampusMapsQuery(place) {
    return place.gps +
        ", Malegaon Budruk, Maharashtra, India";
}

function openCampusMap(place, directionsMode = false) {
    const query = encodeURIComponent(
        getCampusMapsQuery(place)
    );

    const url = directionsMode
        ? "https://www.google.com/maps/dir/?api=1&destination=" + query
        : "https://www.google.com/maps/search/?api=1&query=" + query;

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
}


// =====================================================
// 23. V1 CAMPUS BUTTON EVENTS
// =====================================================

if (campusDetailsButton) {
    campusDetailsButton.addEventListener("click", function() {
        const place = getCampusSelection();

        if (!place || !campusDetails) return;

        const heading = document.createElement("h3");
        heading.textContent = place.name;

        const description = document.createElement("p");
        description.textContent =
            "Description: " + place.description;

        const gps = document.createElement("p");
        gps.textContent =
            "Plus Code: " + place.gps;

        campusDetails.replaceChildren(
            heading,
            description,
            gps
        );

        campusDetails.hidden = false;
    });
}

if (campusMapButton) {
    campusMapButton.addEventListener("click", function() {
        const place = getCampusSelection();

        if (!place) return;

        openCampusMap(place, false);
    });
}

if (campusDirectionsButton) {
    campusDirectionsButton.addEventListener("click", function() {
        const place = getCampusSelection();

        if (!place) return;

        openCampusMap(place, true);
    });
}

if (campusLocationSelect) {
    campusLocationSelect.addEventListener("change", function() {
        if (campusDetails) {
            campusDetails.hidden = true;
            campusDetails.replaceChildren();
        }

        if (campusMessage) {
            campusMessage.textContent = "";
        }
    });
}


// =====================================================
// 24. DIPLOMA PAGE BUTTON
// =====================================================

const openDiplomaButton =
    document.getElementById("openDiplomaNavigation");

if (openDiplomaButton) {
    openDiplomaButton.addEventListener("click", function() {
        window.location.href = "diploma.html";
    });
}
// =====================================================
// 25. SMART CAMPUS ASSISTANT ELEMENTS
// =====================================================

const assistantInput =
    document.getElementById("assistantInput");

const assistantSend =
    document.getElementById("assistantSend");

const assistantResponse =
    document.getElementById("assistantResponse");


// =====================================================
// 26. ASSISTANT TEXT NORMALIZATION
// =====================================================

function normalizeAssistantText(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[?!.,]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function cleanAssistantQuery(query) {
    let cleaned = normalizeAssistantText(query);

    const prefixes = [
        "please take me to",
        "can you take me to",
        "i want to go to",
        "take me to",
        "navigate to",
        "go to",
        "where is",
        "where can i find",
        "find",
        "show me",
        "locate",
        "tell me about"
    ];

    prefixes.forEach(prefix => {
        if (cleaned.startsWith(prefix + " ")) {
            cleaned = cleaned.slice(prefix.length).trim();
        }
    });

    return cleaned;
}


// =====================================================
// 27. FIND CAMPUS DESTINATION
// =====================================================

function findCampusDestination(query) {
    const cleaned = cleanAssistantQuery(query);

    if (!cleaned) return [];

    return Object.keys(campusLocations)
        .filter(name => {
            const normalizedName =
                normalizeAssistantText(name);

            return (
                normalizedName === cleaned ||
                normalizedName.includes(cleaned) ||
                cleaned.includes(normalizedName)
            );
        })
        .map(name => ({
            name,
            ...campusLocations[name]
        }));
}


// =====================================================
// 28. FIND INDOOR DESTINATION
// =====================================================

function findAssistantDestination(query) {
    if (!isDiplomaPage) return [];

    const cleaned = cleanAssistantQuery(query);

    if (!cleaned) return [];

    let results = searchCampusRooms(cleaned);

    if (results.length === 0) {
        const words = cleaned.split(" ")
            .filter(word => word.length > 1);

        results = [];

        floorOrder.forEach(floor => {
            if (!campusFloors[floor]) return;

            campusFloors[floor].rooms.forEach(room => {
                const searchable = normalizeAssistantText(
                    room.name + " " + room.id
                );

                if (
                    words.length > 0 &&
                    words.every(word => searchable.includes(word))
                ) {
                    results.push({ floor, room });
                }
            });
        });
    }

    return results;
}


// =====================================================
// 29. HANDLE CAMPUS DESTINATION
// =====================================================

function handleCampusAssistantRequest(query, results) {
    if (results.length > 1) {
        assistantResponse.textContent =
            "I found multiple campus locations: " +
            results.map(item => item.name).join(", ") +
            ". Please enter a more specific destination.";

        return true;
    }

    if (results.length === 0) {
        return false;
    }

    const place = results[0];
    const normalizedQuery = normalizeAssistantText(query);

    const isNavigationRequest =
        normalizedQuery.includes("take me") ||
        normalizedQuery.includes("navigate") ||
        normalizedQuery.includes("go to") ||
        normalizedQuery.includes("directions") ||
        normalizedQuery.includes("route");

    if (isNavigationRequest) {
        assistantResponse.textContent =
            "Opening Google Maps directions to " +
            place.name + ".";

        openCampusMap(place, true);
    } else {
        assistantResponse.textContent =
            place.name + ": " +
            place.description +
            " Plus Code: " + place.gps +
            ". You can use Open Google Maps or Get Directions.";

        if (campusLocationSelect) {
            campusLocationSelect.value = place.name;

            if (campusDetails) {
                const heading = document.createElement("h3");
                heading.textContent = place.name;

                const description = document.createElement("p");
                description.textContent =
                    "Description: " + place.description;

                const gps = document.createElement("p");
                gps.textContent =
                    "Plus Code: " + place.gps;

                campusDetails.replaceChildren(
                    heading,
                    description,
                    gps
                );

                campusDetails.hidden = false;
            }
        }
    }

    return true;
}


// =====================================================
// 30. HANDLE INDOOR DESTINATION
// =====================================================

function handleIndoorAssistantRequest(query) {
    const results = findAssistantDestination(query);

    if (results.length === 0) return false;

    if (results.length > 1) {
        assistantResponse.textContent =
            "I found multiple matching rooms: " +
            results.map(item =>
                item.room.name + " (" + getFloorName(item.floor) + ")"
            ).join(", ") +
            ". Please enter a more specific name.";

        return true;
    }

    const result = results[0];

    destinationFloor.value = result.floor;

    destinationSelect.value =
        makeRoomOptionValue(result.floor, result.room.id);

    if (destinationSearch) {
        destinationSearch.value = result.room.name;
    }

    clearDestinationSearchResults();

    if (
        navigationMode &&
        navigationMode.value === "manual" &&
        !startSelect.value
    ) {
        assistantResponse.textContent =
            "Destination found: " + result.room.name +
            ". Please select your starting point first.";

        return true;
    }

    if (
        navigationMode &&
        navigationMode.value === "current" &&
        !userCurrentLocation
    ) {
        assistantResponse.textContent =
            "Destination found: " + result.room.name +
            ". Please set your current location on the 3D map first.";

        return true;
    }

    assistantResponse.textContent =
        "Destination identified: " + result.room.name +
        ". Calculating your route...";

    findRoute();

    if (activeNavigation) {
        assistantResponse.textContent =
            "Route generated successfully! Follow the 3D map to reach " +
            result.room.name + ".";
    } else {
        assistantResponse.textContent =
            "I identified the destination, but could not generate the route.";
    }

    return true;
}

// =====================================================
// 31. MAIN ASSISTANT REQUEST HANDLER
// =====================================================

function handleAssistantRequest() {
    if (!assistantInput || !assistantResponse) return;

    const query = assistantInput.value.trim();

    if (!query) {
        assistantResponse.textContent =
            "Please enter a campus location, room or destination name.";

        return;
    }

    // First search campus-wide locations.

    const campusResults = findCampusDestination(query);

    if (
        handleCampusAssistantRequest(
            query,
            campusResults
        )
    ) {
        return;
    }

    // Then search Diploma indoor rooms.

    if (isDiplomaPage) {
        if (handleIndoorAssistantRequest(query)) {
            return;
        }
    }

    assistantResponse.textContent =
        "Sorry, I could not find that destination. " +
        "Try a campus location such as Pharmacy, Canteen or Auditorium" +
        (isDiplomaPage
            ? ", or an indoor room such as AI Lab 1 or Chemistry Lab."
            : ". For indoor rooms, open Diploma Building Navigation first.");
}


// =====================================================
// 32. ASSISTANT SEND BUTTON
// =====================================================

if (assistantSend) {
    assistantSend.addEventListener(
        "click",
        handleAssistantRequest
    );
}

if (assistantInput) {
    assistantInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            handleAssistantRequest();
        }
    });
}


// =====================================================
 // 33. VOICE ASSISTANT - SINGLE VERSION
 // =====================================================

const voiceInput = document.getElementById("assistantInput");
const voiceResponse = document.getElementById("assistantResponse");

const voiceMicButton = document.getElementById("assistantMic");
const voiceSpeakButton = document.getElementById("assistantSpeak");

const BrowserSpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let campusVoiceRecognition = null;
let isVoiceListening = false;


// Speak current assistant response
function speakCampusResponse() {
    if (!voiceResponse) return;

    if (!window.speechSynthesis) {
        voiceResponse.textContent =
            "Speech output is not supported in this browser.";
        return;
    }

    const text = voiceResponse.textContent.trim();

    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
}


// Start or stop microphone
function startCampusVoiceRecognition() {
    if (!voiceInput || !voiceResponse) return;

    if (!BrowserSpeechRecognition) {
        voiceResponse.textContent =
            "Voice recognition is not supported. Please use Google Chrome.";
        return;
    }

    if (isVoiceListening && campusVoiceRecognition) {
        campusVoiceRecognition.stop();
        return;
    }

    campusVoiceRecognition = new BrowserSpeechRecognition();

    campusVoiceRecognition.lang = "en-IN";
    campusVoiceRecognition.continuous = false;
    campusVoiceRecognition.interimResults = false;
    campusVoiceRecognition.maxAlternatives = 1;

    campusVoiceRecognition.onstart = () => {
        isVoiceListening = true;

        if (voiceMicButton) {
            voiceMicButton.textContent = "🔴 Listening...";
        }

        voiceResponse.textContent =
            "Listening. Please speak your destination.";
    };

    campusVoiceRecognition.onresult = event => {
        const command =
            event.results[0][0].transcript.trim();

        voiceInput.value = command;

        handleAssistantRequest();

        speakCampusResponse();
    };

    campusVoiceRecognition.onerror = event => {
        console.error("Speech recognition error:", event.error);

        const errorMessages = {
            "not-allowed":
                "Microphone permission denied. Allow microphone access.",

            "no-speech":
                "No speech detected. Please try again.",

            "network":
                "Network error. Check your internet connection.",

            "audio-capture":
                "Microphone not found.",

            "service-not-allowed":
                "Speech recognition service is unavailable."
        };

        voiceResponse.textContent =
            errorMessages[event.error] ||
            "Voice recognition failed. Please try again.";
    };

    campusVoiceRecognition.onend = () => {
        isVoiceListening = false;

        if (voiceMicButton) {
            voiceMicButton.textContent = "🎤";
        }
    };

    try {
        campusVoiceRecognition.start();
    } catch (error) {
        isVoiceListening = false;

        if (voiceMicButton) {
            voiceMicButton.textContent = "🎤";
        }

        voiceResponse.textContent =
            "Could not start microphone: " + error.message;
    }
}


// Microphone event
if (voiceMicButton) {
    voiceMicButton.addEventListener(
        "click",
        startCampusVoiceRecognition
    );
}


// Speak event
if (voiceSpeakButton) {
    voiceSpeakButton.addEventListener(
        "click",
        speakCampusResponse
    );
}
// =====================================================
// 37. FLOATING AI ASSISTANT POPUP
// =====================================================

const assistantToggle =
    document.getElementById("assistantToggle");

const assistantPopup =
    document.getElementById("assistantPopup");

if (assistantToggle && assistantPopup) {

    assistantToggle.addEventListener("click", function() {
        const isOpening = assistantPopup.hidden;

        assistantPopup.hidden = !isOpening;

        assistantToggle.setAttribute(
            "aria-expanded",
            String(isOpening)
        );

        assistantToggle.textContent =
            isOpening ? "✕" : "🤖";

        assistantToggle.setAttribute(
            "aria-label",
            isOpening
                ? "Close AI Assistant"
                : "Open AI Assistant"
        );
    });

} else {
    console.warn(
        "AI Assistant popup elements not found on this page."
    );
}


// =====================================================
// 38. INITIALIZATION STATUS
// =====================================================

console.log(
    "Campus Navigator script loaded successfully."
);

console.log(
    "Current page:",
    isDiplomaPage
        ? "Diploma Indoor Navigation"
        : "Campus Main Page"
);

console.log("Campus Navigation initialized.");