/**
 *
 *
 */
YUI.add("stalker-slider", function(Y) {
    YUI_config.stalkerbase = YUI_config.stalkerbase || "";

    var SHADERPATH = YUI_config.stalkerbase + "shader/",
            PHONEDRAWPATH = window.location.origin + "/ds",
            //TIME_FOR_FADING = 3 + 1, // 3 + 2
            timeoutExplosion,
            strip_width,
            photo_album,
            vartest = 12000,
            currently_playing = -1,
            shaderMaterial,
            savedState,
            // Shaders that will be loaded on startup
            SHADERS = ["optimized_noise", "particles_fragment",
        "particles_vertex", "texture_fragment_simulation_shader",
        "texture_vertex_simulation_shader", "texture_cpu_to_gpu_vertex_shader",
        "texture_cpu_to_gpu_fragment_shader"],
            camera, scene, renderer, shadowCamera,
            effectsComposer, particles,
            directionalLight, planeTest, gl, cameraRTT,
            sceneRTTPos, rtTexturePos, rtTexturePos2, positionShader,
            generatedTexturePos, textureColor, fboParticles, textureWidth,
            debugScene, startExplodingTime, renderCanvas,
            last = Date.now(),
            start = Date.now(),
            implode = false,
            home = false,
            resizeCanvas = document.createElement('canvas'),
            resizeCtx = resizeCanvas.getContext('2d');

    Y.namespace("Stalker").Slider = Y.Base.create("stalker-slider", Y.Widget, [], {
        CONTENT_TEMPLATE: '<div>'
                + '<div class="details"></div>'
                + '<div class="qr"></div>'
                + '<div id="sink">'
                + '<div id="nav-bar">'
                + '<div id="status"></div>'
                + '</div>'
                + '<div id="preview-image"></div>'
                + '<div id="preview-strip"><!-- prev next --></div>'
                + '</div>'
                + '</div>',
        /**
         *
         */
        initializer: function() {
            this.set("textureWidth", this.get("textureWidth"));                 // Force update
            Y.Stalker.slider = this;                                            // Set up singleton
            this.dreamAlbum = [];
            this.loadPictureDelay = 0;
        },
        populateAlbum: function(pictures) {
            populateAlbum(pictures);
        },
        /**
         *
         * @returns {undefined}
         */
        renderUI: function() {
            this.renderStats();
            Y.one("#sink").addClass("sink-hidden").hide();

            this.loadShaders(function() {                                       // After shaders are retrieved
                this.initScene();                                               // Init Webgl scene

                start = Date.now();                                             // Set noicse animation start time
                last = start;                                                   // Activate explosion

                this.toggleHome();                                              // Paricles should go to initial position

                //this.loadAlbum(ALBUMPATH);                                    // Load the album json final
                //this.loadAlbumFromService(DREAMS_SERVICE_URL);
                this.renderCustomization();                                     // Render side panel
                this.fire("webglInitialized");

                this.animate();                                                 // Start animation
            });
        },
        /**
         *
         * @returns {undefined}
         */
        bindUI: function() {
            Y.delegate("click", function(e) {                                   // Thumbnail clicks
                var node = e.currentTarget.getDOMNode();

                currently_playing = node.info.index;
                this.loadPicture(node.info.photo_url);
                this.showLegend(node.info);
            }, "#preview-strip", "li", this);

            Y.on("windowresize", function() {                                   // Window resize
                if (camera) {
                    var w = window.innerWidth;
                    var h = window.innerHeight;
                    camera.aspect = w / h;
                    camera.updateProjectionMatrix();
                    renderer.setSize(w, h);
                }
            });

            Y.one('doc').on('key', function(e) {                                // Debug mode on § click
                $("#sink").toggle();
            }, "32");

            //$('#play').on('click', this.toggleSlideshow);                     // play/pause
        },
        syncUI: function() {
            this.set("event", this.get("event"));
            this.set("trackCam", this.get("trackCam"));
            this.set("showQr", this.get("showQr"));
            this.set("showLegend", this.get("showLegend"));
        },
        showLegend: function(pictureCfg) {
            var metas,
                    detailsNode = this.get("contentBox").one(".details"),
                    date = new Date(Date.parse(pictureCfg.created_at)),
                    monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            detailsNode.setContent(date.getHours() + ":" + date.getMinutes()
                    + " " + date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear());
            try {
                metas = Y.JSON.parse(pictureCfg.metadatas);
                detailsNode.append("<br />" + metas.event);
            } catch (e) {
                // GOTCHA
            }
        },
        loadAlbum: function(url) {
            this.status('Loading album: ' + url);
            Y.io(url, {
                context: this,
                on: {
                    success: function(tId, e) {
                        var photo, photos = Y.JSON.parse(e.response).photos;
                        this.status(photos.photo.length + " photos found.");
                        photos.sort(comparePhotosDate);
                        for (var i = 0; i < photos.photo.length; i++) {
                            photo = photos.photo[i];
                            this.dreamAlbum.push({
                                name: photo.url,
                                thumbnail_url: YUI_config.stalkerbase + photo.url,
                                photo_url: YUI_config.stalkerbase + photo.url
                            });
                        }
                        this.populateAlbum(this.dreamAlbum);
                        this.selectFirstPicture();
//                        this.startSlideshow();
                    }
                }
            });
        },
        loadAlbumFromService: function(url) {
            this.status('Loading album: ' + url);
            Y.io(url, {
                context: this,
                on: {
                    success: function(tId, e) {
                        var photos = Y.JSON.parse(e.response), photo;
                        Y.log(photos.length + " photos found.");
                        photos.sort(this.comparePhotosDate);
                        for (var i = 0; i < photos.length; i++) {
                            photo = photos[i];
                            this.dreamAlbum.push(Y.mix(photo, {
                                name: photo.id,
                                thumbnail_url: PATH_TO_DREAMS_THUMBNAILS + photo.id + DREAM_EXTENSION,
                                photo_url: PATH_TO_DREAMS + photo.id + DREAM_EXTENSION
                            }));
                        }
                        this.populateAlbum(this.dreamAlbum);
                        this.selectFirstPicture();
//                        this.startSlideshow();
                    }
                }
            });
        },
        selectPicture: function(index) {
            Y.log("Selecting picture:" + index);
            $('#preview-strip>ul>li>img')[index].click();
        },
        selectFirstPicture: function() {
            this.selectPicture(0);
        },
        selectNextPicture: function() {
            Y.log("selectNextPicture()");
            this.selectPicture((currently_playing + 1) % this.photo_album.length);
        },
        toggleSlideshow: function() {
            this.set("slideshowRunning", !this.get("slideshowRunning"));
            //$('#play').html("Start Slideshow");
        },
        startSlideshow: function() {
            Y.log("startSlideshow()");
            this.set("slideshowRunning", true);
            this.advanceSlideshow();
            //$('#play').html("Stop Slideshow");
        },
        startImploding: function() {
            Y.log("Slider.startImploding");
            //implode = true;
            //startExplodingTime = Date.now();

            home = false;
            positionShader.uniforms.tPositions2.texture = positionShader.uniforms.tPositions.texture;
            renderer.render(sceneRTTPos, cameraRTT, savedState, false);
            positionShader.uniforms.tPositions2.texture = savedState;
        },
        advanceSlideshow: function() {
            if (this.slideshow_timer) {
                this.slideshow_timer.cancel();
            }
            if (this.get("slideshowRunning")) {

                Y.log("advanceSlideshow()");
                implode = true;
                this.slideshow_timer = Y.later(this.get("totalDuration") * 1000, this, this.selectNextPicture);

                Y.later(1000 * this.get("implosionDuration"), this, function() {
                    Y.log("implosionTimeout();");
                    implode = false;
                    renderer.deallocateTexture(particles.material.uniforms.color_texture.texture);
                    particles.material.uniforms.color_texture.texture = particles.material.uniforms.next_color_texture.texture;
                });
                timeoutExplosion = Y.later(1000 * this.get("explosionDuration"), this, function() {
                    Y.log("explosionTimeout();");
                    if (home) {
                        this.toggleHome();
                    }
                });
            }
        },
        stopSlideshow: function() {
            this.set("slideshowRunning", false);
            if (this.slideshow_timer) {
                this.slideshow_timer.cancel();
            }
            $('#play').html("Start Slideshow");
        },
        // *******************
        // *** WebGL Scene ***
        // *******************
        /**
         *
         * @param {type} cfg
         */
        loadPicture: function(url, cb) {
            //Y.log("loadPicture()");
            this.loadTexture(url, new THREE.UVMapping(), Y.bind(function(texture) {
                //Y.log("loadPicture.onLoadTexture");
                this.showPicture(texture);
                this.advanceSlideshow();
                //cb();
            }, this));
        },
        /**
         *
         * @param {THREE.Texture} texture
         */
        showPicture: function(texture) {
            //planeTest.scale.x = texture.image.width / texture.image.height;
            //planeTest.material.map = texture;
            //planeTest.visible = !true;
            positionShader.uniforms.photoTexture.texture = texture;
            positionShader.uniforms.photoDimensions.value = new THREE.Vector2(texture.image.width, texture.image.height);
            particles.material.uniforms.photoDimensions.value = positionShader.uniforms.photoDimensions.value;

            //renderer.deallocateTexture(particles.material.uniforms.next_color_texture.texture);
            particles.material.uniforms.next_color_texture.texture = texture;
            startExplodingTime = Date.now();
            if (!home) {
                this.toggleHome();
            }
            if (timeoutExplosion) {
                timeoutExplosion.cancel();
            }
        },
        toggleHome: function() {
            Y.log("toggleHome(" + !home + ")");
            if (!home) {
                home = true;
                savedState = positionShader.uniforms.tPositions2.texture;
            } else {
                this.startImploding();
            }
        },
        animate: function() {
            requestAnimationFrame(Y.bind(this.animate, this));
            this.step();
        },
        step: function() {
            //Y.log("step()");
            if (this.doReload) {
                if (this.loadPictureDelay === 0) {
                    this.loadPicture(Y.Stalker.canvas.canvasNode.toDataURL("image/png"));// Show its image in the slider
                    this.loadPictureDelay = 2;
                    this.doReload = false;
                }
                this.loadPictureDelay -= 1;
            }

            this.stats.begin();

            var now = Date.now(),
                    lapsed = now - last;
            last = now;

            if (startExplodingTime) {
                var implosionLapse = (now - startExplodingTime) / 1000,
                        transition = (implosionLapse <= this.get("implosionDuration")) ?
                        implosionLapse / this.get("implosionDuration") : 1,
                        fadeTransition = (implosionLapse <= this.get("fadingDuration")) ?
                        implosionLapse / this.get("fadingDuration") : 1;

                particles.material.uniforms.transition.value = this.get("slideshowRunning") ? fadeTransition : 1;
                positionShader.uniforms.transition.value = transition;
            }

            // Simulation
            positionShader.uniforms.delta.value = lapsed / 1000;
            positionShader.uniforms.time.value = (now - start) / 1000;
            positionShader.uniforms.implode.value = implode ? 1 : 0;
            positionShader.uniforms.home.value = home ? 1 : 0;
            renderer.render(sceneRTTPos, cameraRTT, positionShader.uniforms.tPositions.texture, false);
            if (!home) {
                var tmp = positionShader.uniforms.tPositions.texture;
                positionShader.uniforms.tPositions.texture = positionShader.uniforms.tPositions2.texture;
                positionShader.uniforms.tPositions2.texture = tmp;
                particles.material.uniforms.position_texture.texture = positionShader.uniforms.tPositions.texture;
            }

            if (this.get("trackCam")) {
                this.controls.update();
            }
            renderer.render(scene, camera);

            this.stats.end();
        },
        /**
         * Retrieves a texture by url, using THREE.ImageLoader.
         *
         * @param {string} url
         * @param {THREE.Mapping} mapping
         * @param {function} onLoad
         * @param {function} onError
         * @returns {THREE.Texture}
         */
        loadTexture: function(url, mapping, onLoad, onError) {
            var texture = new THREE.Texture(undefined, mapping),
                    loader = new THREE.ImageLoader();
            loader.addEventListener('load', function(event) {
                texture.image = event.content;
                texture.needsUpdate = true;
                if (onLoad)
                    onLoad(texture);
            });
            loader.addEventListener('error', function(event) {
                if (onError)
                    onError(event.message);
            });
            loader.load(url);
            return texture;
        },
        /**
         * Load shaders using io request and then call callback
         *
         * @param {function} cb
         */
        loadShaders: function(cb) {
            var i;
            this.counter = SHADERS.length;
            this.shaders = {};
            for (i = 0; i < SHADERS.length; i += 1) {
                Y.io(SHADERPATH + SHADERS[i] + ".c", {
                    context: this,
                    arguments: SHADERS[i],
                    on: {
                        success: function(tId, e, name) {
                            this.shaders[name] = e.response;
                            this.counter -= 1;
                            if (this.counter === 0) {
                                cb.apply(this);
                            }
                        }
                    }
                });
            }
        },
        /**
         * Returns a loaded shader, replacing and including external scripts
         * @param {type} name
         * @returns {string} the shader
         */
        getShader: function(name) {
            return this.shaders[name].replace(/\/\/==(.*)==/g, Y.bind(function(found, name) {
                return this.getShader("optimized_noise");
                //return this.getShader(name);
            }, this));
        },
        debugTextures: function() {
            debugScene = new THREE.Scene();
            var debugCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
            debugCamera.position.z = 1200 - 500;
            var material1 = new THREE.MeshBasicMaterial({
                map: rtTexturePos
            });
            var plane1 = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), material1);
            plane1.rotation.x = Math.PI / 2;
            plane1.position.x = -300;
            var material2 = new THREE.MeshBasicMaterial({
                map: rtTexturePos2
            });
            var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), material2);
            plane2.rotation.x = Math.PI / 2;
            plane2.position.x = 300;
            debugScene.add(plane1);
            debugScene.add(plane2);
            debugScene.add(debugCamera);
            this.render = function() {
                //console.log('debug render');
                renderer.render(debugScene, debugCamera);
            }
        },
        generateTexturePos: function() {
            var n = textureWidth * textureWidth,
                    positions = [], x, y, z,
                    w = resizeCanvas.width,
                    h = resizeCanvas.height;
            for (var k = 0; k < n; k++) {
                x = k % w - w / 2;
                y = h / 2 - Math.floor(k / w);
                z = 0;
                positions.push(x, y, z, 1.0);
            }
            return THREE.FBOUtils.createTextureFromData(textureWidth, textureWidth, positions);
        },
        generateTextureColor: function(resizeData) {
            var n = textureWidth * textureWidth, colors = [],
                    w = resizeCanvas.width, h = resizeCanvas.height,
                    wh = w * h;
            for (var k = 0; k < n; k++) {
                if (k < wh) {
                    colors.push(resizeData[k * 4] / 255, resizeData[k * 4 + 1] / 255, resizeData[k * 4 + 2] / 255, resizeData[k * 4 + 3] / 255);
                } else {
                    colors.push(0, 0, 0, 0);
                }
            }
            return THREE.FBOUtils.createTextureFromData(textureWidth, textureWidth, colors);
        },
        /**
         *
         * Generate the sprite used for particles
         *
         * @param {type} gradientCfg
         * @returns {_L5.Anonym$1.generateParticle.texture}
         */
        generateParticle: function(gradientCfg) {
            var i, g, texture, context, gradient,
                    canvas = document.createElement('canvas');

            gradientCfg = gradientCfg || this.get("particleTexture");
            canvas.width = 128;
            canvas.height = 128;
            var context = canvas.getContext('2d');
            context.beginPath();
            context.arc(64, 64, 60, 0, Math.PI * 2, false);
            context.closePath();
            context.lineWidth = 0.5;
            context.stroke();
            context.restore();
            var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0,
                    canvas.width / 2, canvas.height / 2, canvas.width / 2);

            for (i = 0; i < gradientCfg.length; i += 1) {
                g = gradientCfg[i];
                gradient.addColorStop(+g[0], 'rgba(' + g[1] + ',' + g[2] + ',' + g[3] + ',' + g[4] + ')');
            }
            context.fillStyle = gradient;
            context.fill();

            texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            return texture;
        },
        loadingImage: function() {
            var ctx, t,
                    c = document.createElement('canvas'),
                    w = 800,
                    h = 600;
            c.width = w;
            c.height = h;
            ctx = c.getContext('2d');
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, w, h);
            ctx.fillText("LOADING...", w / 2, h / 2);
            t = new THREE.Texture(c);
            t.needsUpdate = true;
            return t;
        },
        resetCamera: function() {
            this.camera.position.x = 0;
            this.camera.position.y = 0;
            this.camera.position.z = 400;
            this.camera.rotation.x = 0;
            this.camera.rotation.y = 0;
            this.camera.rotation.z = 0;
            this.camera.scale.x = 1;
            this.camera.scale.y = 1;
            this.camera.scale.z = 1;
            this.camera.up.x = 0;
            this.camera.up.y = 1;
            this.camera.up.z = 0;
            this.controls.reset();
        },
        /**
         *
         */
        initScene: function() {
            Y.log("initScene()");

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
            this.camera = camera;
            scene.add(camera);
            shadowCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
            shadowCamera.position.z = 1000;
            scene.add(shadowCamera);
            var blank = THREE.ImageUtils.generateDataTexture(1, 1, new THREE.Color());
            planeTest = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 2, 2), new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: blank
            }));
            planeTest.rotation.x = Math.PI / 2;
            planeTest.position.z = -500;
            planeTest.visible = false;
//            scene.add(planeTest); // Removed for optim
            directionalLight = new THREE.SpotLight(0xffffff);
            directionalLight.position = camera.position;
            renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.autoClear = false;
            this.get("contentBox").appendChild(renderer.domElement);
            renderer.domElement.id = 'particleCanvas';
            renderCanvas = renderer.domElement;
            effectsComposer = new PostComposer(window.innerWidth, window.innerHeight, renderer, scene, shadowCamera);
            this.initRTT();

            this.controls = new THREE.TrackballControls(camera, renderCanvas);
            this.controls.enabled = this.get("trackCam");

            this.resetCamera();
            //this.controls.noRotate = this.controls.noPan = !this.get("trackCam");

            var attributes = {
                size: {
                    type: 'f',
                    value: []
                },
                customColor: {
                    type: 'c',
                    value: []
                },
                aPoints: {
                    type: 'v2',
                    value: []
                },
                opacity: {
                    type: 'float',
                    value: []
                }
            }, uniforms = {
                position_texture: {
                    type: "t",
                    value: 0,
                    texture: rtTexturePos
                },
                particle_texture: {
                    type: "t",
                    value: 1,
                    texture: this.generateParticle()
                },
                color_texture: {
                    type: "t",
                    value: 2,
                    texture: null
                },
                next_color_texture: {
                    type: "t",
                    value: 3,
                    texture: null
                },
                photoDimensions: {
                    type: "v2",
                    value: new THREE.Vector2(1, 1)
                },
                fboWidth: {
                    type: "f",
                    value: textureWidth
                },
                afterEffects: {
                    type: "i",
                    value: 1
                },
                transition: {
                    type: "f",
                    value: 0.0
                },
                particleSize: {
                    type: "f",
                    value: this.get("particleSize")
                }
            };

            shaderMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
                attributes: attributes,
                vertexShader: this.getShader('particles_vertex'),
                fragmentShader: this.getShader('particles_fragment'),
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            });
            var geometry = new THREE.Geometry(),
                    particleCount = textureWidth * textureWidth;
            for (var i = 0; i < particleCount; i++) {
                geometry.vertices.push(new THREE.Vector3());
            }
            particles = new THREE.ParticleSystem(geometry, shaderMaterial);
            var vertices = geometry.vertices, i, y, x,
                    values_size = attributes.size.value,
                    values_color = attributes.customColor.value,
                    values_opacity = attributes.opacity.value,
                    w = resizeCanvas.width, h = resizeCanvas.height,
                    resizeData = resizeCtx.getImageData(0, 0, w, h).data,
                    textureCoords = [], d = 1 / textureWidth;

            textureColor = this.generateTextureColor(resizeData);
            uniforms.color_texture.texture = textureColor;

            for (y = d / 2; y < 1; y += d) {
                for (x = d / 2; x < 1; x += d) {
                    textureCoords.push(new THREE.Vector2(x, y));
                }
            }
            attributes.aPoints.value = textureCoords;
            scene.add(particles);
        },
        initRTT: function() {
            gl = renderer.getContext();
            if (!gl.getExtension("OES_texture_float")) {
                alert("No OES_texture_float support for float textures!");
                return;
            }
            if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) === 0) {
                alert("No support for vertex shader textures!");
                return;
            }
            cameraRTT = new THREE.OrthographicCamera(-textureWidth / 2, textureWidth / 2, textureWidth / 2, -textureWidth / 2, -1000000, 1000000);
            cameraRTT.position.z = 100;
            generatedTexturePos = this.generateTexturePos();
            rtTexturePos = new THREE.WebGLRenderTarget(textureWidth, textureWidth, {
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping,
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat,
                type: THREE.FloatType,
                stencilBuffer: false
            });
            rtTexturePos2 = rtTexturePos.clone();
            positionShader = new THREE.ShaderMaterial({
                uniforms: {
                    time: {
                        type: "f",
                        value: -1
                    },
                    delta: {
                        type: "f",
                        value: 0
                    },
                    tPositions: {
                        type: "t",
                        value: 0,
                        texture: generatedTexturePos
                    },
                    tPositions2: {
                        type: "t",
                        value: 1,
                        texture: generatedTexturePos
                    },
                    implode: {
                        type: "i",
                        value: 0
                    },
                    home: {
                        type: "i",
                        value: 0
                    },
                    photoTexture: {
                        type: "t",
                        value: 3,
                        texture: null
                    },
                    photoDimensions: {
                        type: "v2",
                        value: new THREE.Vector2(1, 1)
                    },
                    fboWidth: {
                        type: "f",
                        value: textureWidth
                    },
                    transition: {
                        type: "f",
                        value: 0
                    },
                    explosionType: {
                        type: "i",
                        value: 0
                    }
                },
                vertexShader: this.getShader('texture_vertex_simulation_shader'),
                fragmentShader: this.getShader('texture_fragment_simulation_shader')
            });
            sceneRTTPos = new THREE.Scene();
            sceneRTTPos.add(cameraRTT);
            var plane = new THREE.PlaneGeometry(textureWidth, textureWidth);
            quad = new THREE.Mesh(plane, positionShader);
            quad.rotation.x = Math.PI / 2;
            quad.position.z = -5000;
            sceneRTTPos.add(quad);
            fboParticles = new THREE.FBOUtils(textureWidth, renderer);
            console.time('rtt1');
            fboParticles.pushDataToTexture(generatedTexturePos, rtTexturePos);
            console.timeEnd('rtt1');
            console.time('rtt2');
            fboParticles.renderToTexture(rtTexturePos, rtTexturePos2);
            console.timeEnd('rtt2');
            positionShader.uniforms.tPositions.texture = rtTexturePos;
            positionShader.uniforms.tPositions2.texture = rtTexturePos2;
            generatedTexturePos = rtTexturePos.clone();
            fboParticles.renderToTexture(rtTexturePos, generatedTexturePos);
        },
        // ***************************
        // *** CUSTOMIZATION PANEL ***
        // ***************************
        /**
         *
         */
        renderCustomization: function() {
            var choices = new Array();
            choices.push({label: "Nuage de fils", value: 0});
            for(var i= 0; i < events.length; i++){
                choices.push({label: events[i]["name"], value: events[i]["id"]});
            }
            var params = new Y.inputEx.Group({
                parentEl: Y.one("#nav-bar"),
                legend: "Options (space to toogle)",
                collapsible: true,
                fields: [{
                        type: "select",
                        name: "event",
                        label: "Event",
                        choices:choices
                    }, {
                        name: "showQr",
                        label: "Show QR",
                        type: "boolean"
                    }, {
                        type: "select",
                        name: "textureWidth",
                        label: "Grid width",
                        choices: [{
                                label: "4K (64x64) particles - Lowest quality",
                                value: 64
                            }, {
                                label: "16K particles (128x128) - Low quality",
                                value: 128
                            }, {
                                label: "64K particles (256x256) - Acceptable quality",
                                value: 256
                            }, {
                                label: "256k particles (512x512) - Great quality (recommended)",
                                value: 512
                            }, {
                                label: "1M particles (1024x1024) - Superb quality",
                                value: 1024
                            }, {
                                label: "4M particles (2048x2048) - Awesome quality!",
                                value: 2048
                            }]
                    }, {
                        type: "select",
                        name: "explosionType",
                        label: "Explosion type",
                        choices: [{
                                value: 0,
                                label: "Noise Wave"
                            }, {
                                value: 1,
                                label: "Orb Attractors"
                            }, {
                                value: 2,
                                label: "Orb Repellers"
                            }, {
                                value: 3,
                                label: "Air brakes"
                            }, {
                                value: 4,
                                label: "Plain"
                            }, {
                                value: 5,
                                label: "Sphere"
                            }, {
                                value: 6,
                                label: "Cone"
                            }, {
                                value: 7,
                                label: "Supershape"
                            }]
                    }, {
                        type: "select",
                        name: "afterEffects",
                        label: "Color effect",
                        choices: [{
                                value: 0,
                                label: "Normal"
                            }, {
                                value: 1,
                                label: "XPro"
                            }, {
                                value: 2,
                                label: "Vintage"
                            }]
                    }, {
                        name: "totalDuration",
                        label: "Total duration"
                    }, {
                        name: "implosionDuration",
                        label: "Implosion duration"
                    }, {
                        name: "explosionDuration",
                        label: "Explosion duration"
                    }, {
                        name: "fadingDuration",
                        label: "Fading duration"
                    }, {
                        name: "particleSize",
                        label: "Particle size"
                    }, {
                        name: "particleTexture",
                        label: "Particle gradient",
                        type: "list",
                        useButtons: true,
                        elementType: {
                            type: "combine",
                            fields: [{
                                    label: "pos",
                                    size: 2
                                }, {
                                    label: "r",
                                    size: 2
                                }, {
                                    label: "g",
                                    size: 2
                                }, {
                                    label: "b",
                                    size: 2
                                }, {
                                    label: "a",
                                    size: 2
                                }]
                        }
                    }]
            });
            params.setValue(this.getAttrs());

            //@fixme
            params.on("updated", this.setAttrs, this);
        },
        //Sort pictures by date desc
        comparePhotosDate: function(a, b) {
            var da = new Date(a.created_at);
            var db = new Date(b.created_at);
            da = da.getTime();
            db = db.getTime();
            if (da < db)
                return 1;
            if (da > db)
                return -1;
            return 0;
        },
        renderStats: function() {
            this.stats = new Stats();
            //this.stats.setMode(1);
            Y.one("#sink").append(this.stats.domElement);
        },
        status: function(text) {
            Y.one('#status').setHTML(text);
        }
    }, {
        ATTRS: {
            slideshowRunning: {
                value: false
            },
            trackCam: {
                value: false,
                setter: function(val) {
                    if (this.controls) {
                        this.controls.enabled = val;
                        //this.controls.noRotate = this.controls.noPan = !val;
                    }
                    return val;
                }
            },
            showLegend: {
                value: false,
                setter: function(val) {

                    if (val) {
                        this.get("contentBox").one(".details").show();
                    } else {
                        this.get("contentBox").one(".details").hide();
                    }
                    return val;
                }
            },
            showQr: {
                value: true,
                setter: function(val) {
                    if (val) {
                        this.get("contentBox").one(".qr").show();
                    } else {
                        this.get("contentBox").one(".qr").hide();
                    }
                    return val;
                }
            },
            event: {
                value: "Secret room",
                setter: function(val) {
                    var url = PHONEDRAWPATH + "?e=" + escape(val);
                    console.log("Rendering qr for link :", url);
                    this.get("contentBox").one(".qr").setHTML(
                            //  '<span>AND WHAT IS <br />YOUR WISH dream? </span>'
                            '<img src="frontend/img/UI_wall_invite_150.png" style="padding: 10px 17px 0 0;"/><br />'
                            + '<div class="qr-mask"></div>'
                            + '<div class="qrBg"><div class="qrCrop"><img src="'
                            //  + "http://chart.apis.google.com/chart?cht=qr&chs=130x130&chld=Q&choe=UTF-8&chl="
                            + "http://qrickit.com/api/qr?fgdcolor=000000&bgdcolor=ffffff&qrsize=180&t=p&e=m&d="
                            + encodeURIComponent(url) + '" /></div></div>'
                            //+ '<br />scan this QR or go to <br /><a target="_blank" href="' + url + '">' + url + "</a>");
                            //  + '<br />Scan this or go to<br /><a href="' + url + '">' + url + "</a> with your mobile to tell us your dream"
                            );

                    return val;
                }
            },
            textureWidth: {
                value: 512,
                setter: function(val) {
                    textureWidth = val;
                    return val;
                }
            },
            particleSize: {
                value: 13, //default 10
                setter: function(val) {
                    if (shaderMaterial) {
                        shaderMaterial.uniforms['particleSize'].value = val;
                    }
                    return val;
                }
            },
            particleTexture: {
//                value: [
//                    [0, 255, 255, 255, 1],
//                    [0.2, 255, 255, 255, 1],
//                    [0.4, 200, 200, 200, 1],
//                    [1, 0, 0, 0, 1]
//                ],
                value: [
                    [0, 255, 255, 255, 1],
                    [0.2, 255, 255, 255, 1],
                    [0.4, 100, 100, 200, 1],
                    [1, 0, 0, 255, 1]
                ],
                setter: function(val) {
                    if (shaderMaterial) {
                        shaderMaterial.uniforms['particle_texture'].texture = this.generateParticle(val);
                    }
                    return val;
                }
            },
            afterEffects: {
                value: 0,
                setter: function(val) {
                    if (shaderMaterial) {
                        shaderMaterial.uniforms['afterEffects'].value = val;
                    }
                    return val;
                }
            },
            explosionType: {
                value: 0,
                setter: function(val) {
                    positionShader.uniforms['explosionType'].value = val;
                    return val;
                }
            },
            totalDuration: {
                value: 8 * 2
            },
            implosionDuration: {
                value: 6
            },
            explosionDuration: {
                value: 4 + 2
            },
            fadingDuration: {
                value: 2
            }
        }
    });

    function populateAlbum(the_album) {
        Y.Stalker.slider.photo_album = the_album;
        var ul = $('<ul />');
        var strip = $('#preview-strip');
        var autofire;
        var laste;
        currently_playing = -1;
        function mousemove(e) {
            if (!e)
                e = laste;
            else
                laste = e;
            var toMove;
            var margins = 100;
            strip_width = strip.width();
            if (e.clientX < margins) {
                toMove = -10;
            } else if ((strip_width - e.clientX) < margins) {
                toMove = 10;
            }
            if (toMove)
                strip.scrollLeft(strip.scrollLeft() + toMove);
        }
        strip.on('mousemove', mousemove).on('mouseover', function(e) {
            laste = e;
            autofire = setInterval(mousemove, 25);
        }).on('mouseout', function(e) {
            clearInterval(autofire);
        }).on('scroll', function(e) {
            checks();
        });
        function checks() {
            var ins = [], outs = [];
            $('#preview-strip>ul>li').each(function(a, b) {
                var c = $(b);
                var moo = isInView(c);
                if (moo) {
                    ins.push(b);
                    c.trigger('smartload');
                } else {
                    outs.push(b);
                }
            });
        }
        function isInView(b) {
            var thumbx = b.offset().left;
            var left = 0;
            var more = 200;
            if ((thumbx + b.width() + more) < left) {
                return false;
            } else if (thumbx > (strip_width + left + more)) {
                return false;
            }
            return true;
        }
        $('#preview-strip').html(ul);
        function createThumbnail(photo_album, index) {
            var info = photo_album[index],
                    name = info.name,
                    thumbnail_url = info.thumbnail_url,
                    img = new Image();

            info.index = index;

            img.visible = false;
            if (name) {
                img.alt = name;
            }
            var li = $('<li />').append(img);
            li[0].info = photo_album[index];
            ul.append(li);
            li.hover(function(e) {
                return;
                var o = $(this).offset();
                var b = $(window).height() - o.top + 10;
                var cloned = img.cloneNode();
                $('#preview-image').html(cloned).width(info.thumbnail_width).
                        height(info.thumbnail_height).css({
                    left: o.left + 'px',
                    bottom: b + 'px'
                }).show();
            }).mouseout(function(e) {
                $('#preview-image').hide();
            }).on('smartload', smartload);
            var hasActivated = false;
            var scaleImages = true;
            function smartload() {
                if (hasActivated)
                    return;
//                img.src = thumbnail_url;
                hasActivated = true;
            }
            $(img).load(function(e) {
                var t = $(this).show();
                var w = img.width, h = img.height, asp = w / h, target = 80;
                if (scaleImages) {
                    if (w >= h) {
                        w = target;
                        h = w / asp;
                    } else {
                        h = target;
                        w = asp * h;
                    }
                    t.width(w).height(h);
                } else {
                    t.css('left', (80 - w) / 2 + 'px');
                }
                t.css('top', (80 - h) / 2 + 'px');
            });
        }
        for (var i = 0; i < the_album.length; i++) {
            createThumbnail(the_album, i);
        }
        checks();
    }

    function PostComposer(width, height, renderer, scene, camera) {
        var renderTarget, renderTargetParameters;
        var renderComposer;
        renderTargetParameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        };

        renderTarget = new THREE.WebGLRenderTarget(width, height, renderTargetParameters);
        renderComposer = new THREE.EffectComposer(renderer, renderTarget);
        var renderSource = new THREE.RenderPass(scene, camera);
        renderSource.clearColor = new THREE.Color(0x000000);
        renderSource.clearAlpha = 1;
        var effectSave = new THREE.SavePass(new THREE.WebGLRenderTarget(width, height, renderTargetParameters));
        var effectBlend = new THREE.ShaderPass(THREE.ShaderExtras["blend"], "tDiffuse1");
        effectBlend.uniforms['tDiffuse2'].texture = effectSave.renderTarget;
        effectBlend.uniforms['mixRatio'].value = 0.95;
        effectBlend.renderToScreen = true;
        renderComposer.addPass(renderSource);
        renderComposer.addPass(effectSave);
        renderComposer.addPass(effectBlend);
        this.render = function() {
            renderComposer.render();
        };

        this.setPersistance = function(mix) {
            effectBlend.uniforms['mixRatio'].value = mix;
        };
    }

    Y.hasWebgl = function() {
        try {
            return!!window.WebGLRenderingContext && !!document.createElement('canvas').
                    getContext('experimental-webgl');
        } catch (e) {
            return false;
        }
    };

    // ** THREE.js *** //

    THREE.FBOUtils = function(textureWidth, renderer) {
        gl = renderer.getContext();
        if (!gl.getExtension("OES_texture_float")) {
            alert("No OES_texture_float support for float textures!");
            return;
        }
        if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) === 0) {
            alert("No support for vertex shader textures!");
            return;
        }
        var cameraRTT = new THREE.OrthographicCamera(-textureWidth / 2, textureWidth / 2, textureWidth / 2, -textureWidth / 2, -1000000, 1000000);
        cameraRTT.position.z = 100;
        var rtTexturePos = new THREE.WebGLRenderTarget(textureWidth, textureWidth, {
            wrapS: THREE.RepeatWrapping,
            wrapT: THREE.RepeatWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false
        });
        var cpu_gpu_material = new THREE.ShaderMaterial({
            uniforms: {
                tPositions: {
                    type: "t",
                    value: 0,
                    texture: null
                }
            },
            vertexShader: Y.Stalker.slider.getShader("texture_cpu_to_gpu_vertex_shader"),
            fragmentShader: Y.Stalker.slider.getShader("texture_cpu_to_gpu_fragment_shader")
        });
        var sceneRTTPos = new THREE.Scene();
        sceneRTTPos.add(cameraRTT);
        var plane = new THREE.PlaneGeometry(textureWidth, textureWidth);
        quad = new THREE.Mesh(plane, positionShader);
        quad.rotation.x = Math.PI / 2;
        quad.position.z = -5000;
        sceneRTTPos.add(quad);
        this.textureWidth = textureWidth;
        this.sceneRTTPos = sceneRTTPos;
        this.cameraRTT = cameraRTT;
        this.renderer = renderer;
        this.cpu_gpu_material = cpu_gpu_material;
    };

    THREE.FBOUtils.createTextureFromData = function(width, height, data) {
        var texture = new THREE.DataTexture(new Float32Array(data), width, height, THREE.RGBAFormat, THREE.FloatType, null, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter);
        texture.needsUpdate = true;
        return texture;
    };

    THREE.FBOUtils.prototype.renderToTexture = function(texture, renderToTexture) {
        this.cpu_gpu_material.uniforms.tPositions.texture = texture;
        this.renderer.render(this.sceneRTTPos, this.cameraRTT, renderToTexture, false);
    };

    THREE.FBOUtils.prototype.pushDataToTexture = function(data, renderToTexture) {
        var texture = THREE.FBOUtils.createTextureFromData(this.textureWidth, this.textureWidth, data);
        this.renderToTexture(texture, renderToTexture);
    };
});
