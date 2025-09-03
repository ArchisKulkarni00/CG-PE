import Stats from './jsm/libs/stats.module.js'

export default class CustomStats{

    constructor(x=5,y=5){
        this.statsFPS = Stats()
        this.statsMem = Stats()
        this.statsTim = Stats()
        this.x = x;
        this.y = y;
    }

    showAllPanels() {
        this.showFPS();
        this.showMem();
        this.showTim();
    }

    showFPS(){
        this.statsFPS.showPanel(0)
        this.statsFPS.dom.style.position = 'absolute';
        this.statsFPS.dom.style.top = this.x+'px';
        this.statsFPS.dom.style.left = this.y+'px';
        this.statsFPS.dom.style.pointerEvents = 'none';
        document.body.appendChild(this.statsFPS.dom)
    }

    showMem(){
        this.statsMem.showPanel(2)
        this.statsMem.dom.style.position = 'absolute';
        this.statsMem.dom.style.top = this.x+50+'px';
        this.statsMem.dom.style.left = this.y+'px';
        this.statsMem.dom.style.pointerEvents = 'none';
        document.body.appendChild(this.statsMem.dom)
    }
    
    showTim(){
        this.statsTim.showPanel(1)
        this.statsTim.dom.style.position = 'absolute';
        this.statsTim.dom.style.top = this.x+100+'px';
        this.statsTim.dom.style.left = this.y+'px';
        this.statsTim.dom.style.pointerEvents = 'none';
        document.body.appendChild(this.statsTim.dom)
    }

    updateAll(){
        this.updateFPS();
        this.updateMem();
        this.updateTim();
    }

    updateFPS(){
        this.statsFPS.update();
    }
    updateMem(){
        this.statsMem.update();
    }
    updateTim(){
        this.statsTim.update();
    }
}