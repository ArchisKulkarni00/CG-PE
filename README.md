# LiDAR Digital Twin Visualizer
This project is a visualizer for lidar based point clouds along with 3D data.

## Instructions for setup

### Visualizer Setup
- Clone the repo
- Ensure you have node installed on your system
- Open command prompt and run: `npm install`
- After installation run: `npm start`
- Head over to: `http://localhost:3000`


### Potree Setup
- You may also want to install Potree. Head to this page and download the release zip: `https://github.com/potree/potree/releases`
- Create a `potree` folder under public folder in this project.
- Paste the contents of downloaded zip file under it.
- Download the `pointclouds` folder from: `https://github.com/potree/potree/tree/develop` and place under the `potree` folder created earlier.


### Data Setup
**Potree examples folder**
- If you want to load the potree examples follow the above mentioned Potree Setup
- Once the setup is complete you can find the examples shipped along with potree under `potree/pointclouds`.

*Note: The Lion pointcloud data is available in this repo itself under `assets/Point-Clouds` folder along with the Vegetation.ply file required for Threejs demo. For the AHN demos, please follow the below instructions.*

**AHN Tiles (Used in the included demos)**
- For the AHN Demos you need to download the tile separately as it is too big to ship with this repo.
- Download it from the link here. [OneDrive Link](https://iiitbac-my.sharepoint.com/:f:/g/personal/kulkarniarchis_sanjay_iiitb_ac_in/IgDIhWIzFAE2RpuBPz4wR5jUAfYQS0RE83N22Ff483Gb9YM?e=nCl2bx)
- Once downloaded, place the downloaded folders into `public/converted/` folder.

**Other AHN Tiles**
- If you want to use any other AHN tiles, you need to download the tile separately as it is too big to ship with this repo.
- Download it from the link here. [AHN-Dataset](https://geotiles.citg.tudelft.nl)
- Once downloaded you can paste the LAZ file into the converter.
- This shall place the converted files into `public/converted/` folder. 

## Custom Demos

So you want to create your own demos! Let's see how to do that.

### Files and structure:
- In the public fold there are two types of fil, ones starting with `Ex` are example files, the ones starting with `Cmp` component files.
- Example files have actual demos while Component files define certain building blocks (classes and functions) used to create the demos.
- Each demo example has two files associated with it, one HTML file(contains basic structure of the html page) and one JavaScript file(this has all the graphics and file loading logic).
- Finally there is a `index.html` file which has links to all the demos, and it is the one you see when you open `localhost:3000`.
- For each demo, we call the files in this general format:
` index.html --> Ex-Somedemo.html --> Ex-Somedemo.js` 

### How to add new demo
1. Firstly copy paste any corresponding set of HTML and js files. 
2. In the `index.html` find the `<div class="card-container">`. Add the following lines inside that div (you can reference that same file to see how other demos are added):
```html
<div class="card">
    <img src="assets/City1.png" alt="City Buildings Only" class="card-img">
    <div class="card-content">
        <h3>City-BuildingsOnly</h3>
        <p>Basic grid based city model with simple cuboids as buildings.</p>
        <a href="/Ex-City-BuildingsOnly.html" class="card-link">Launch Scene</a>
    </div>
</div>
```
3. Update the fields:
     - image src(you can place any thumbnail image under `public/assets` and use it here), alt
     - h3, this is the demo heading
     - p tag, this is the demo description
     - a tag href, add the name of the html file you created in step 2
4. Now in the html file created in step 2, update the `<script type="module" src="Ex-Somedemoname.js"></script>` line and rename the src with the name of the newly created js file from step 2.
5. That's it. Now you may play with the code in the js file and have your own demo.

