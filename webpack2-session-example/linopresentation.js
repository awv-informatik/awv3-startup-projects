import * as THREE from 'three';
import { Object3 } from 'awv3/three';
import { Pool } from 'awv3/session/helpers';
import { exponential } from 'awv3/animation/easing';

export default class LinoPresentation extends Pool {
    constructor(args) {
        super(args);

        this.options = {
            shadows: true,
            lights: true,
            ambient: 0.25,
            light: 0.75,
            ...this.session.options
            //...args
        };

        this._objects = new Objects({ pool: this });
        super.add(this._objects);

        if (this.options.shadows) {
            this._stage = new Stage({ pool: this });
            super.add(this._stage);
        }

        if (this.options.lights) {
            this._lights = new Lights({ pool: this });
            super.add(this._lights);
        }
    }

    add(args) { this._objects.add(args); }
    addAsync(args) { return this._objects.addAsync(args); }
    remove(args) { this._objects.remove(args); }
    removeAsync(args) { return this._objects.removeAsync(args); }

    update() {
        if (this.view) {
            this._objects.update();
            this.options.lights && this._lights.update();
            this.options.shadows && this._stage.update();
        }
    }
}

class Lights extends Object3 {
    constructor({ pool }) {
        super();
        this.name = "presentation.lights";
        this.pool = pool;
        this.interactive = false;
        this.tweens = false;
        this.measurable = false;
        this.addLightHelper = false;

        // if (this.pool.options.ambient) {
        //     this.ambient = new THREE.AmbientLight(0xffffff, this.pool.options.ambient);
        //     this.add(this.ambient);
        // }

        this.hemi = new THREE.HemisphereLight( 0xffffff, 0xbbbbbb, this.pool.options.ambient);

        this.direct1 = new THREE.DirectionalLight(0xffffff);
        this.direct1.target = pool._objects;

        this.direct2 = new THREE.DirectionalLight(0xffffff);
        this.direct2.target = pool._objects;

        this.direct3 = new THREE.DirectionalLight(0xffffff);
        this.direct3.target = pool._objects;

        this.direct4 = new THREE.DirectionalLight(0xffffff);
        this.direct4.target = pool._objects;

        this.direct5 = new THREE.DirectionalLight(0xffffff);
        this.direct5.target = pool._objects;

        this.add(this.hemi);
        this.add(this.direct1);
        this.add(this.direct2);
        this.add(this.direct3);
        this.add(this.direct4);
        this.add(this.direct5);


        // this.spot2 = new THREE.SpotLight(0xff0000);
        // this.spot2.target = pool._objects;
        // this.spot2.castShadow = true;
        // this.spot2.penumbra = 1;
        // this.spot2.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(20, 1, 100, 1000));
        // this.spot2.shadow.mapSize.width = 2048;
        // this.spot2.shadow.mapSize.height = 2048;
        // this.add(this.spot2);
    }

    update() {
        if (this.pool.parent) {

            // if (this.pool.options.ambient) {
            //     this.ambient.intensity = this.pool.options.ambient;
            // }

            if (this.pool.options.ambient) {
                this.hemi.intensity = this.pool.options.ambient;
            }

            let radius = this.pool._objects.radius;
            let intensity = this.pool.options.light;
            let vec = this.pool.parent.worldToLocal(new THREE.Vector3(-radius / 2, radius, radius / 2));

            this.direct1.intensity = intensity / 2;
            this.direct1.setPosition(0, radius, 0);

            this.direct2.intensity = intensity / 2;
            this.direct2.setPosition(0, radius/4, radius);

            this.direct3.intensity = intensity / 2;
            this.direct3.setPosition(0, radius/4, -radius);

            this.direct4.intensity = intensity / 2;
            this.direct4.setPosition(radius, radius/2, 0);

            this.direct5.intensity = intensity / 2;
            this.direct5.setPosition(-radius, radius/2, 0);

            if(!!this.pool.scene && this.addLightHelper){
              this.addLightHelper = false;
              this.pool.scene.add(new THREE.DirectionalLightHelper(this.direct1, 5 ));
              this.pool.scene.add(new THREE.DirectionalLightHelper(this.direct2, 5 ));
              this.pool.scene.add(new THREE.DirectionalLightHelper(this.direct3, 5 ));
              this.pool.scene.add(new THREE.DirectionalLightHelper(this.direct4, 5 ));
              this.pool.scene.add(new THREE.DirectionalLightHelper(this.direct5, 5 ));
            }

            // this.spot2.intensity = intensity;
            // this.spot2.position.copy(vec);
            // this.spot2.shadow.camera.far = radius * 1.5;
            // this.spot2.shadow.camera.updateProjectionMatrix();
            // this.spot2.insensity = intensity;
            // this.spot2.distance = radius * 1.5;
            // this.spot2.angle = Math.PI / 6;
        }
    }
}

class Stage extends Object3 {
    constructor({ pool }) {
        super();
        this.name = "presentation.stage";
        this.pool = pool;
        this.interactive = false;
        this.tweens = false;
        this.measurable = false;
    }

    update() {
        this.destroy();
        if (!isNaN(this.pool._objects.width) && !isNaN(this.pool._objects.depth)) {
            this.position.copy(this.pool._objects.getCenter());
            this.position.y -= this.pool._objects.height * 0.5;
            this.rotation.x = - Math. PI / 2;
            var shadowGeo = new THREE.PlaneBufferGeometry( this.pool._objects.width * 1.2, this.pool._objects.depth * 1.2, 1, 1 );
            var mesh = new THREE.Mesh(shadowGeo, shadowMaterial);
            this.add( mesh );
        }
    }
}

class Objects extends Object3 {
    constructor({ pool }) {
        super();
        this.name = "presentation.objects";
        this.pool = pool;
        this.addAxisHelper = true;
        this.addSky = true;
    }

    update() {
        this.updateBounds();
        this.min = this.bounds.box.min;
        this.max = this.bounds.box.max;
        this.width = this.max.distanceTo(new THREE.Vector3(this.min.x, this.max.y, this.max.z));
        this.height = this.max.distanceTo(new THREE.Vector3(this.max.x, this.min.y, this.max.z));
        this.depth = this.max.distanceTo(new THREE.Vector3(this.max.x, this.max.y, this.min.z));
        this.radius = this.getRadius() * 6;

        if(!!this.pool.scene && this.addAxisHelper){
          this.addAxisHelper = false;
          this.pool.scene.add(new THREE.AxisHelper( 10 ));
        }

        if(!!this.pool.scene && this.addSky){
          this.addSky = false;

          let path = "./textures/env/r";
          let paths = ['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((item, index) => path + item + ".jpg");

          // let background = new THREE.CubeTextureLoader().load( paths );
          // background.format = THREE.RGBFormat;
          // background.needsUpdate = true;

          let background = new THREE.TextureLoader().load(path + "px.jpg");
          //let background = new THREE.Color("lightgrey");

           this.pool.scene.background = background;
          // console.log(this.pool.scene.background);


          // var cubeShader = THREE.ShaderLib[ "cube" ];
  				// var cubeMaterial = new THREE.ShaderMaterial( {
  				// 	fragmentShader: cubeShader.fragmentShader,
  				// 	vertexShader: cubeShader.vertexShader,
  				// 	uniforms: cubeShader.uniforms,
  				// 	depthWrite: false,
  				// 	side: THREE.BackSide} );
  				// cubeMaterial.uniforms[ "tCube" ].value = background;
  				// this.pool.scene.add( new THREE.Mesh( new THREE.BoxGeometry( 1000, 1000, 1000 ), cubeMaterial ) );

        }

    }
}

function createShadowMaterial() {
    var canvas2d = document.createElement( 'canvas' );
    canvas2d.width = 128;
    canvas2d.height = 128;
    var context = canvas2d.getContext( '2d' );
    var gradient = context.createRadialGradient( canvas2d.width / 2, canvas2d.height / 2, 0, canvas2d.width / 2, canvas2d.height / 2, canvas2d.width / 2 );
    gradient.addColorStop( 0.1, 'rgba(0,0,0,0.15)' );
    gradient.addColorStop( 1, 'rgba(0,0,0,0)' );
    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas2d.width, canvas2d.height );
    var shadowTexture = new THREE.CanvasTexture( canvas2d );
    return new THREE.MeshBasicMaterial( { map: shadowTexture, transparent: true } );
}

const shadowMaterial = createShadowMaterial();
