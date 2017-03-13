import "babel-polyfill";
import * as THREE from 'three';
import delay from 'delay';
import Canvas from 'awv3/core/canvas';
import View from 'awv3/core/view';
import Session from 'awv3/session';
import pool from 'LinoPresentation';

const canvas = new Canvas({ dom: '#main', pixelated: false, resolution: 1.0, antialias: true, alpha: true});

const view = new View(canvas, {
  up: new THREE.Vector3(0, 1, 0),
  near: 10, far: 20000,
	minDistance: 20, maxDistance: 15000,
	ambientIntensity: 0,
  opacity: 1.0
  //,background: reflectionCube
  //,background: new THREE.Color("white")
});
view.showStats = true;

let controlActive;
let controlIdle;
controlActive = function(){
  view.controls._idleCallbacks.push(controlIdle);
  view.renderer.resolution = 0.75;
  view.renderer.resize();
};
controlIdle = function(){
  view.controls._activeCallbacks.push(controlActive);
  view.renderer.resolution = 1.0;
  view.renderer.resize();
};
view.controls._activeCallbacks.push(controlActive);

let path = "./textures/env/r";
let paths = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((item, index) => path + item + ".jpg");
let reflectionCube = new THREE.CubeTextureLoader().load( paths );

const materialsSettings = {
	edgeColor: new THREE.Color("rgb(10, 10, 10)"),
	edgeOpacity: 0.35,
	lazy: true,
	multi: false,
	shadows: false,
  envMap: reflectionCube,
	meshes: {
		shader: THREE.MeshPhysicalMaterial,
    //shader: THREE.MeshPhongMaterial,
    //shader: THREE.MeshStandardMaterial, // no clearCoat better performance
		options: {
      //shading: THREE.FlatShading,
			transparent: false,
			fog: false,
			reflectivity: 0.3,
			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1,
			emissive: new THREE.Color("rgb(0, 0, 0)"),
			metalness: 0.5,
			roughness: 0.8,
			clearCoat: 0.0,
			clearCoatRoughness: 0.0
      //,	envMapIntensity: 1.0
		}
	}
}

const session = window.session = new Session({ view, pool, bla: 1, throttle: 250, materials: materialsSettings,
    async defaultConnection(connection) {

      let tree = await fetch("models/lastExport.json");
  		let asm = await tree.json();
  		asm.root = 3;
      connection.init(asm);

  		view.controls.focus().zoom().rotate(Math.PI / 3, Math.PI / 3);

  		let toLoads = Object.keys(asm)
  			.map((k) => asm[k])
  			.filter(o => o.solids)
  			.map(o => {
  				let a = o.max[0] - o.min[0];
  				let b = o.max[1] - o.min[1];
  				let c = o.max[2] - o.min[2];
  				return {
  					size: Math.sqrt(a*a + b*b + c*c),
  					file: o.name
  				};
  			})
  			.sort((a, b) => b.size - a.size)
  			.reduce((a,b)=> a.concat(b.file), []);

  		toLoads.forEach(async file => {
        //await delay(2000); //todo: remove
        let primitives = await connection.stream(`models/${file}.json`);
        console.log("primitives loaded...");
      });

      // setTimeout(()=>connection.init({
      //           '1': { id: 1, name: '', class: '', parent: null },
      //           root: 1
      //       }), 2000);

    }
});

session.addResources({
  "\\organic\\wood\\oak\\polished oak.jpg": "textures/organic/wood/oak/polished oak.jpg" ,
  "\\organic\\wood\\beech\\unfinished beech.jpg": "textures/organic/wood/beech/unfinished beech.jpg",
  "\\organic\\wood\\mahogany\\polished mahogany.jpg": "textures/organic/wood/mahogany/polished mahogany.jpg",
  "\\metal\\polished\\steel.jpg": "textures/metal/polished/steel.jpg",
  "\\pattern\\checker.jpg": "textures/pattern/checker.jpg"
});

session.addResources({
  "riffle_normal": "normals/riffle_normal.jpg" ,
  "edm_spark_normal": "normals/edm_spark_normal.jpg"
});
