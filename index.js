let selectedItem = {};
const items = [];

let selectedGrid = {};
const bag = {
	cols: 4,
	rows: 4,
	element: null,
	rect: null,
};

const res = {
	cols: 2,
	rows: 4,
	element: null,
	rect: null,
}
const con = {
	cols: 4,
	rows: 1,
	element: null,
	rect: null,
}
const points = [];

const canvas = document.getElementById('lines-container');
const ctx = canvas.getContext('2d');
const body = document.body;
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
  window.addEventListener('resize', ()=>{
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;
});


let mouseOffset = {x: 0, y: 0};
const squareSize = 50;
const squareHalf = 25;
let showRays = false;

createGridsAndItems();

function createGridsAndItems(){
	createGrid("bag", 16);
	createGrid("resources", 8);
	createGrid("consumables", 4);

	createItem({type: "bag",			name: "A",			width: 1, height: 1});
	createItem({type: "bag",			name: "B", 			width: 1, height: 1});
	createItem({type: "bag",			name: "C", 			width: 1, height: 1});
	createItem({type: "bag",			name: "D", 			width: 1, height: 1});
	createItem({type: "bag",			name: "Casco",		width: 2, height: 1});
	createItem({type: "bag",			name: "Chancletas",	width: 2, height: 1});
	createItem({type: "bag",			name: "Motosierra", width: 2, height: 2});
	createItem({type: "bag",			name: "Palo",		width: 2, height: 2});
	createItem({type: "resources",		name: "E", 			width: 1, height: 1});
	createItem({type: "resources",		name: "F", 			width: 1, height: 1});
	createItem({type: "resources",		name: "Recurso", 	width: 2, height: 1});
	createItem({type: "resources",		name: "Recurso 2", 	width: 2, height: 2});
	createItem({type: "consumables",	name: "G", 			width: 1, height: 1});
	createItem({type: "consumables",	name: "H", 			width: 1, height: 1});
	createItem({type: "consumables",	name: "Manzanas", 	width: 2, height: 1});

	makeItNeat();
}
function createGrid(type, nomberOfCells) {
	const grid = getGrid(type);
	grid.element = document.getElementById(`grid-${type}`);
	
	for (let i = 0; i < nomberOfCells; i++) {
		const cellElement = document.createElement("div");
		cellElement.classList.add("cell");
		cellElement.setAttribute("data-id", i + 1);
		grid.element.appendChild(cellElement);
	}
}
function createItem({name, width, height, type, x, y}) {
	// crea el item (objeto)
	const item = {
		id: items.length,
		name,
		width,
		height,
		type,
		element: document.createElement("div"),
		rect: null,
	};
	// crea el item (elemento) ^
	item.element.classList.add("item", `item-${item.width}x${item.height}`);
	item.element.textContent = item.name;
	item.element.style.left = `${x}px`;
	item.element.style.top = `${y}px`;
	item.element.setAttribute("data-type", item.type);
	item.element.setAttribute("data-itemid", item.id);
	item.element.addEventListener("mousedown", onItemGrab);

	// agrega el item al array de items y el item.element al body
	items.push(item);
	document.body.appendChild(item.element);
}
function onItemGrab(event) {
	selectedItem = items[parseInt(event.target.dataset.itemid,10)];
	selectedItem.rect = selectedItem.element.getBoundingClientRect();

	selectedGrid = getGrid(selectedItem.type);
	selectedGrid.rect = selectedGrid.element.getBoundingClientRect();

	setPoints();

	mouseOffset.x = event.pageX - selectedItem.rect.left;
 	mouseOffset.y = event.pageY - selectedItem.rect.top;

	setActiveGrid(selectedItem.type);
	selectedItem.element.classList.add("grabbing");
	document.addEventListener("mousemove", onItemMove);
	selectedItem.element.addEventListener("mouseup", onItemDrop);
}
function setPoints(){
	points.length = 0;

	const gridRectX = selectedGrid.rect.x;
	const gridRectY = selectedGrid.rect.y;

	let gridCells = selectedGrid.cols * selectedGrid.rows;
	let gridCols = selectedGrid.cols;

	if(selectedItem.width === 1){
		for(let i = 0; i < gridCells; i++){
			const point = { x: gridRectX + (gridCols - (i%gridCols) - 1 ) * squareSize + squareHalf, y: gridRectY + Math.floor(i/gridCols) * squareSize + squareHalf };
			let uniquePoint = document.elementFromPoint(point.x, point.y);
			if(uniquePoint.className === "cell"	|| uniquePoint === selectedItem.element){
				point.empty = true;
			}
			else point.empty = false;
			points.push(point);
		}
	}
	else if(selectedItem.width === 2 && selectedItem.height === 1){
		for(let i = 0; i < gridCells; i++){
			if((i+1) % gridCols !== 0){
				const point = {x: gridRectX + (gridCols - (i%gridCols) - 1 ) * squareSize, y: gridRectY + Math.floor(i/gridCols) * squareSize + squareHalf};
				let rightPoint = document.elementFromPoint(point.x + 5, point.y);
				let leftPoint = document.elementFromPoint(point.x - 5, point.y);
				if( (rightPoint.className === "cell" || rightPoint === selectedItem.element) &&
					(leftPoint.className === "cell" || leftPoint === selectedItem.element))
				{
					point.empty = true;
				}
				else point.empty = false;
				points.push(point);
			}
		}
	}
	else if(selectedItem.width === 2 && selectedItem.height === 2){
		let cellsArrayLength = gridCols * 3;
		for(let i = 0; i < cellsArrayLength; i++){
			if((i+1) % gridCols !== 0){
				const point = {x: gridRectX + (gridCols - (i%gridCols) - 1 ) * squareSize, y: gridRectY + Math.floor(i/gridCols) * squareSize + squareSize};
				let topRightPoint = document.elementFromPoint(point.x + 5, point.y + 5);
				let topLeftPoint = document.elementFromPoint(point.x - 5, point.y + 5);
				let botRightPoint = document.elementFromPoint(point.x + 5, point.y - 5);
				let botLeftPoint = document.elementFromPoint(point.x - 5, point.y - 5);
				if( (topRightPoint.className === "cell" || topRightPoint === selectedItem.element) &&
					(topLeftPoint.className === "cell" || topLeftPoint === selectedItem.element) &&
					(botRightPoint.className === "cell" || botRightPoint === selectedItem.element) &&
					(botLeftPoint.className === "cell" || botLeftPoint === selectedItem.element))
				{
					point.empty = true;
				}
				else point.empty = false;
				points.push(point);
			}
		}
	}
}
function onItemMove(event) {
	selectedItem.x = event.clientX - mouseOffset.x;
	selectedItem.y = event.clientY - mouseOffset.y;
	selectedItem.element.style.left = selectedItem.x + "px";
	selectedItem.element.style.top = selectedItem.y + "px";
	
	if(!showRays) return;

	clearCanvas();
	
	for(let i = 0; i < points.length; i++){
		ctx.beginPath();
		ctx.moveTo(selectedItem.x + selectedItem.rect.width * .5, selectedItem.y + selectedItem.rect.height * .5);
		ctx.lineTo(points[i].x, points[i].y);

		if( points[i].empty ) ctx.strokeStyle = "rgb(22, 128, 22)";
		else ctx.strokeStyle = "rgb(139, 32, 32)";

		ctx.lineWidth = 2;
		ctx.stroke();
	}
}
function onItemDrop() {
	clearCanvas();

	selectedItem.rect = selectedItem.element.getBoundingClientRect(); // hay que actualizar el BoundingClientRect del item porque la posición ha cambiado (en onItemMove no hacía falta actualizarlo porque no se usan las posiciones x e y)
	selectedItem.element.classList.remove("grabbing");
	document.removeEventListener("mousemove", onItemMove);
	selectedItem.element.removeEventListener("mouseup", onItemDrop);
	
	const gridRect = selectedGrid.rect;
	const itemRect = selectedItem.rect;
	const margin = 10;

	// fuera del grid actual
	if (
		gridRect.right < itemRect.left ||
		gridRect.left > itemRect.right ||
		gridRect.bottom < itemRect.top ||
		gridRect.top > itemRect.bottom
  	){
		const inventoryRect = document.getElementById("inventory").getBoundingClientRect();

		// límites de inventoryRect con el margen
		const marginInventoryRect = {
			left: inventoryRect.left - margin,
			top: inventoryRect.top - margin,
			right: inventoryRect.right + margin,
			bottom: inventoryRect.bottom + margin,
		};
	
		// comprueba si itemRect está dentro de inventoryRect con margen
		if (
			itemRect.left < marginInventoryRect.right &&
			itemRect.right > marginInventoryRect.left &&
			itemRect.top < marginInventoryRect.bottom &&
			itemRect.bottom > marginInventoryRect.top
		) {
			// como hay colision, calcula los centros de los rectángulos
			const itemCenterX = itemRect.left + itemRect.width / 2;
			const itemCenterY = itemRect.top + itemRect.height / 2;
			const inventoryCenterX = inventoryRect.left + inventoryRect.width / 2;
			const inventoryCenterY = inventoryRect.top + inventoryRect.height / 2;
	
			// y determina la dirección de la colisión basada en los centros
			if (Math.abs(itemCenterX - inventoryCenterX) > Math.abs(itemCenterY - inventoryCenterY)) {
				// colisión horizontal
				if (itemCenterX > inventoryCenterX) { // mueve a la derecha
					selectedItem.element.style.left = `${marginInventoryRect.right}px`;
				} else {// mueve a la izquierda
					selectedItem.element.style.left = `${marginInventoryRect.left - itemRect.width}px`;
				}
			} else {
				// colisión vertical
				if (itemCenterY > inventoryCenterY) { // mueve hacia abajo
					selectedItem.element.style.top = `${marginInventoryRect.bottom}px`;
				} else { // mueve hacia arriba
					selectedItem.element.style.top = `${marginInventoryRect.top - itemRect.height}px`;
				}
			}
		}
	}
	// dentro del grid actual
	else{
		let shorterPoint= {x: 0, y: 0};
		let shorterDistance = 5000;
		let distance;
		for(let i = 0; i < points.length; i++){
			if ( points[i].empty ){
				distance = Math.sqrt(Math.pow(points[i].x - itemRect.width/2 - itemRect.x, 2) + Math.pow(points[i].y - itemRect.height/2 - itemRect.y, 2));
				if(distance < shorterDistance) {
					shorterDistance = distance;
					shorterPoint.x = window.innerWidth / 2 - (points[i].x - selectedItem.width * squareHalf + 1);
					shorterPoint.y = window.innerHeight / 2 - (points[i].y - selectedItem.height * squareHalf + 1);
				}
			}
		}
		// si hay distancia es porque hay como minímo un espacio para ese item
		if(distance){
			selectedItem.element.style.left = `calc(50% - ${shorterPoint.x}px)`;
			selectedItem.element.style.top = `calc(50% - ${shorterPoint.y}px)`;
		}
		// si no hay distancia es porque no hay ningún espacio para ese item (se devuelve al origen)
		else {
			const inventoryRect = document.getElementById("inventory").getBoundingClientRect();
			console.log(selectedItem.rect)
			console.log(inventoryRect)
			if((selectedItem.rect.left + selectedItem.rect.width/2) > (inventoryRect.left + inventoryRect.width/2)) selectedItem.element.style.left = `${inventoryRect.right + margin}px`;
			else selectedItem.element.style.left = `${inventoryRect.left - selectedItem.rect.width - margin}px`;
		}
	}
	removeActiveGrid();
}
function getGrid(type){
	switch(type){
		case "bag":
			return bag;
		case "resources":
			return res;
		case "consumables":
			return con;
	}
}
function setActiveGrid(type){
    document.body.setAttribute("data-active-grid", type);		
}
function removeActiveGrid() {
    document.body.setAttribute("data-active-grid", ""); // no lo borro para que la transición al quitarlo tenga efecto
}
function isPointEmpty(pointX, pointY){
	const elements = document.elementsFromPoint(pointX, pointY);
	const filteredElements = elements.filter(elemento => elemento !== selectedItem.element);

	if (filteredElements.length > 0) {

		if( // si el punto obtenido no devuelve un elemento cell, significa que está ocupado o fuera del grid (puede ser fuera ya que con los items de más de 1x1 compruebo los puntos adyacentes también)
			(selectedItem.width === 1 && document.elementFromPoint(pointX, pointY).className === "cell") ||
			(selectedItem.width === 2 && selectedItem.height === 1 &&
				(
					(document.elementFromPoint(pointX + 5, pointY).className === "cell") &&
					(document.elementFromPoint(pointX - 5, pointY).className === "cell")
				)
			) ||
			(selectedItem.width === 2 && selectedItem.height === 2 &&
				(
					(document.elementFromPoint(pointX - 5, pointY + 5).className === "cell") &&
					(document.elementFromPoint(pointX + 5, pointY + 5).className === "cell") &&
					(document.elementFromPoint(pointX + 5, pointY - 5).className === "cell") &&
					(document.elementFromPoint(pointX - 5, pointY - 5).className === "cell")
				)
			)
		) return true;
		else return false;
	} else return false;
}
function clearCanvas(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// jugando un poco con los items
addingListenerToMenu();

function addingListenerToMenu(){
	const menu = document.getElementById("menu");
	menu.addEventListener("click", makeAnAction);
}
function makeAnAction(e){

	clearCanvas(); // solo por si existen los rayos del botón "activar rayos"

	const el = e.target;
	switch (el.id){
		case "spider":
			makeASpider();
			break;
		case "deer":
			makeADeer();
			break;
		case "greeting":
			makeAGreeting();
			break;
		case "robot":
			makeARobot();
			break;
		case "switch-rays":
			switchRays(el);
			break;
		case "random":
			makeAMess();
			break;
		case "order":
			makeItNeat();
			break;
	}
}
function getRandom(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function makeADeer(){
	const positions = [
		{ x: -252,	y: -320 },	// A
		{ x: -322,	y: -182 },	// B
		{ x: 192,	y: -300 },	// C
		{ x: 242,	y: -180 },	// D
		{ x: 178,	y: -150 },	// Casco
		{ x: 222,	y: -280 },	// Chancletas
		{ x: 295,	y: -340 },	// Motosierra
		{ x: 255,	y: -260 },	// Palo
		{ x: -402,	y: -282 },	// E
		{ x: -301,	y: -192 },	// F
		{ x: -322,	y: -300 },	// Recurso
		{ x: -371,	y: -275 },	// Recurso 2
		{ x: 252,	y: -170 },	// G
		{ x: -392,	y: -309 },	// H
		{ x: -276,	y: -170 },	// Manzanas
	]
	makeTheOrder(positions);
}
function makeAGreeting(){
	const positions = [
		{ x: -382,	y: -80 	},	// A
		{ x: -390,	y: -120 },	// B
		{ x: -370,	y: -130 },	// C
		{ x: -250,	y: -120 },	// D
		{ x: -320,	y: -10  },	// Casco
		{ x: -315,	y: 20	},	// Chancletas
		{ x: -310,	y: -100 },	// Motosierra
		{ x: -360,	y: -90  },	// Palo
		{ x: -320,	y: -264 },	// E
		{ x: -281,	y: -132 },	// F
		{ x: -340,	y: -115 },	// Recurso
		{ x: -310,	y: 50   },	// Recurso 2
		{ x: -318,	y: -160 },	// G
		{ x: -320,	y: -212 },	// H
		{ x: -304,	y: 123	},	// Manzanas
	]
	makeTheOrder(positions);
}
function makeARobot(){
	const positions = [
		{ x: 192,	y: -370 },	// A
		{ x: 192,	y: -310 },	// B
		{ x: 192,	y: -250 },	// C
		{ x: 192,	y: -190 },	// D
		{ x: 192,	y: -130 },	// Casco
		{ x: 192,	y: -130 },	// Chancletas
		{ x: 192,	y: -70  },	// Motosierra
		{ x: 192,	y: -70  },	// Palo
		{ x: -242,	y: -370 },	// E
		{ x: -242,	y: -310 },	// F
		{ x: -292,	y: -130 },	// Recurso
		{ x: -292,	y: -70  },	// Recurso 2
		{ x: -242,	y: -250 },	// G
		{ x: -242,	y: -190 },	// H
		{ x: -292,	y: -130 },	// Manzanas
	]
	makeTheOrder(positions);
}
function makeASpider(){
	const positions = [
		{ x: -242,	y: 210 },	// A
		{ x: 62,	y: 202 },	// B
		{ x: -82,	y: 195 },	// C
		{ x: 302,	y: 190 },	// D
		{ x: 242,	y: 160 },	// Casco
		{ x: -322,	y: 140  },	// Chancletas
		{ x: -285,	y: 90  },	// Motosierra
		{ x: 190,	y: 80  },	// Palo
		{ x: 52,	y: 182 },	// E
		{ x: -92,	y: 182 },	// F
		{ x: 122,	y: 155  },	// Recurso
		{ x: -232,	y: 140  },	// Recurso 2
		{ x: -262,	y: 250 },	// G
		{ x: -322,	y: 160 },	// H
		{ x: 162,	y: 190 },	// Manzanas
	]
	makeTheOrder(positions);
}
function switchRays(el){
	if(showRays){
		showRays = false;
		el.textContent = "Rayos (off)";
		el.classList.remove("show");
	}
	else{
		showRays = true;
		el.textContent = "Rayos (on)";
		el.classList.add("show");

		// activo todos los rayos a modo de ejemplo de manera chusquera
		let consumableRect = con.element.getBoundingClientRect();
		let gridRectX = consumableRect.x;
		let gridRectY = consumableRect.y;
	
		let gridCells = con.cols * con.rows;
		let gridCols = con.cols;

		let elRect = el.getBoundingClientRect();

		for(let i = 0; i < gridCells; i++){
			const point = { x: gridRectX + (gridCols - (i%gridCols) - 1 ) * squareSize + squareHalf, y: gridRectY + Math.floor(i/gridCols) * squareSize + squareHalf };
			let uniquePoint = document.elementFromPoint(point.x, point.y);
			if(uniquePoint.className === "cell") point.empty = true;
			else point.empty = false;

			ctx.beginPath();
			ctx.moveTo(elRect.left + elRect.width * .5, elRect.top);
			ctx.lineTo(point.x, point.y);
	
			if( point.empty ) ctx.strokeStyle = "rgb(22, 128, 22)";
			else ctx.strokeStyle = "rgb(139, 32, 32)";
	
			ctx.lineWidth = 2;
			ctx.stroke();
		}
	}
}
function makeAMess(){
	const positions = [
		{ x: 320,	y: -220 },	// A
		{ x: 192,	y: -310 },	// B
		{ x: -192,	y: 222 },	// C
		{ x: 380,	y: -32 },	// D
		{ x: -312,	y: 32  },	// Casco
		{ x: -332,	y: -142  },	// Chancletas
		{ x: 192,	y: 192  },	// Motosierra
		{ x: -82,	y: -322  },	// Palo
		{ x: -362,	y: 122 },	// E
		{ x: -292,	y: -292 },	// F
		{ x: -392,	y: -62  },	// Recurso
		{ x: 222,	y: -132  },	// Recurso 2
		{ x: 282,	y: 112 },	// G
		{ x: -422,	y: -292 },	// H
		{ x: -310,	y: 252 },	// Manzanas
	]
	makeTheOrder(positions);
}
function makeItNeat(){
	const positions = [
		{ x: -161,	y: -136 },	// A
		{ x: -111,	y: -136 },	// B
		{ x: -61,	y: -136 },	// C
		{ x: -11,	y: -136 },	// D
		{ x: -161,	y: -86  },	// Casco
		{ x: -61,	y: -86  },	// Chancletas
		{ x: -161,	y: -36  },	// Motosierra
		{ x: -61,	y: -36  },	// Palo
		{ x: 61,	y: -136 },	// E
		{ x: 111,	y: -136 },	// F
		{ x: 61,	y: -86  },	// Recurso
		{ x: 61,	y: -36  },	// Recurso 2
		{ x: -100,	y: 123 },	// G
		{ x: -50,	y: 123 },	// H
		{ x: 0,		y: 123 },	// Manzanas
	]
	makeTheOrder(positions);
}
function makeTheOrder(positions){
	const itemElement = document.querySelectorAll(".item");
	for(let i = 0; i < positions.length; i++){
		itemElement[i].style = `left: calc(50% + ${positions[i].x}px); top: calc(50% + ${positions[i].y}px)`;
	}
}