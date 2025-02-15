class Deaths{
    sharkDeath(reason){

        playedTime += clock.getElapsedTime();
        clock.stop();


        var waterNormals;
        var parameters = {
            width: 2000,
            height: 2000,
            widthSegments: 250,
            heightSegments: 250,
            depth: 1500,
            param: 4,
            filterparam: 1
        };


        var scene = new Physijs.Scene();
        scene.add( new THREE.AmbientLight( 0x444444 ) );

        scene.fog = new THREE.FogExp2( 0xaabbbb, 0.0001 );
        //

        var light = new THREE.DirectionalLight( 0xffffbb, 1 );
        light.position.set( - 1, 1, - 1 );
        scene.add( light );

        //

        waterNormals = new THREE.TextureLoader().load( 'shared/models/textures/waternormals.jpg' );
        waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

        water = new THREE.Water( renderer, camera, scene, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: waterNormals,
            alpha: 	1.0,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 50.0,
            fog: scene.fog != undefined
        } );


        var mirrorMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( parameters.width * 500, parameters.height * 500 ),
            water.material
        );

        mirrorMesh.add( water );
        mirrorMesh.rotation.x = - Math.PI * 0.5;
        scene.add( mirrorMesh );


        var cubeMap = new THREE.CubeTexture( [] );
        cubeMap.format = THREE.RGBFormat;

        var loader = new THREE.ImageLoader();
        loader.load( 'shared/models/textures/skybox.png', function ( image ) {

            var getSide = function ( x, y ) {

                var size = 1024;

                var canvas = document.createElement( 'canvas' );
                canvas.width = size;
                canvas.height = size;

                var context = canvas.getContext( '2d' );
                context.drawImage( image, - x * size, - y * size );

                return canvas;

            };

            cubeMap.images[ 0 ] = getSide( 2, 1 ); // px
            cubeMap.images[ 1 ] = getSide( 0, 1 ); // nx
            cubeMap.images[ 2 ] = getSide( 1, 0 ); // py
            cubeMap.images[ 3 ] = getSide( 1, 2 ); // ny
            cubeMap.images[ 4 ] = getSide( 1, 1 ); // pz
            cubeMap.images[ 5 ] = getSide( 3, 1 ); // nz
            cubeMap.needsUpdate = true;

        } );

        var cubeShader = THREE.ShaderLib[ 'cube' ];
        cubeShader.uniforms[ 'tCube' ].value = cubeMap;

        var skyBoxMaterial = new THREE.ShaderMaterial( {
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        } );

        var skyBox = new THREE.Mesh(
            new THREE.BoxGeometry( 1000000, 1000000, 1000000 ),
            skyBoxMaterial
        );

        scene.add( skyBox );

        player.position.set(0,300,0);
        player.rotation.y = 0;
        player.__dirtyPosition = true;
        player.__dirtyRotation = true;

        var seconds = Math.round(playedTime);
        var minutes = Math.round(seconds / 60);
        var hours = Math.round(minutes / 60);

        seconds -= minutes * 60;
        minutes -= hours * 60;
        if (seconds < 10){seconds = '0' + seconds;}
        if (minutes < 10){minutes = '0' + minutes;}
        if (hours < 10){hours = '0' + hours;}

        warn("you died by " + reason + ', time: ' + hours + ':'+ minutes + ':' + seconds);

        return scene;
    }
}