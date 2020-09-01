// 模型、光照、镜头、场景、渲染器

class App {
    constructor(canvas, model, animations){
        this.scene = App.createScene()
                    .add(model)
                    .add(App.createAmbientLight())
                    .add(App.createDirectionalLight());
        // 镜头
        this.camera = App.createCamera();
        // 渲染器
        this.renderer = App.createRenderer(canvas);

        // 动画混合器
        this.mixer = new AnimationMixer(model, animations);

        this.update();

    }

    update() {
        this.resize();
        this.mixer.update();
        this.renderer.render(this.scene, this.camera);
        // 注册自动刷新
        window.requestAnimationFrame(()=>{this.update()});
    }

    // 画布的重置
    resize() {
        let canvasSize = this.renderer.getSize(new THREE.Vector2());
        let windowSize = new THREE.Vector2(window.innerWidth, window.innerHeight);
        if(!canvasSize.equals(windowSize)) {
            // 重置画布和镜头比例
            this.renderer.setSize(windowSize.x, windowSize.y, false);
            this.camera.aspect = windowSize.x / windowSize.y;
            this.camera.updateProjectionMatrix();
        }        
    }

    // 场景
    static createScene() {
        let scene = new THREE.Scene();
        scene.background = new THREE.Color(0x336495);
        return scene;
    }

    // 背景光or环境光
    static createAmbientLight() {
        return new THREE.AmbientLight(0xffffff, 1);
    }

    // 方向光
    static createDirectionalLight() {
        let light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(0, 400, 350);
        return light;
    }

    // 镜头
    static createCamera() {
        let camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );// 设置镜头的大小、长宽比、角度、位置
        camera.position.z = 10;
        camera.position.x = 0;
        camera.position.y = -3;
        return camera;
    }

    // 渲染器
    static createRenderer(canvas) {
        let renderer = new THREE.WebGLRenderer({canvas});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ReinhardToneMapping;// 颜色映射
        renderer.toneMappingExposure = 2.0;
        return renderer;
    }

}

// 播放动画：动画混合器：Threejs的mixer封装
class AnimationMixer{
    constructor(model, animations){
        this.clock = new THREE.Clock();
        this.mixer = new THREE.AnimationMixer(model);
        this.animations = animations;
    }

    play(clip) {
        let animation = this.animations.find(a => a.name === clip);
        if(animation) {
            this.mixer.stopAllAction();
            this.mixer.clipAction(animation).play();
            this.clip = clip;
        }
    }

    update(){
        let delta = this.clock.getDelta();
        this.mixer.update(delta);
    }
}

// 加载模型
let loader = new THREE.GLTFLoader();
loader.load('models/multi.glb', function(gltf){
    let model = gltf.scene;
    model.scale.set(10, 10, 10);
    model.position.y = -6;

    let canvas = document.querySelector('#app-canvas');
    let app = new App(canvas, model, gltf.animations);
    app.mixer.play('CatWalk');

    // 切换动画
    document.querySelector('.switch-button').addEventListener('click', ()=>{
        const clips = [
            'CatWalk',
            'Samba',
            'Belly',
        ];
        let clipIndex = clips.indexOf(app.mixer.clip);
        clipIndex = (clipIndex + 1) % clips.length;
        app.mixer.play(clips[clipIndex]);
    });
}, undefined,function(error){
    console.error(error);
});