document.addEventListener("DOMContentLoaded", function() {
   

    // ScrollMagic Controller Setup
    var controller = new ScrollMagic.Controller();
    var scenes = [];
    var panels = document.querySelectorAll('.panel');

    panels.forEach(function(panel, i) {
        scenes[i] = new ScrollMagic.Scene({
            triggerElement: panel,
            duration: "100%",  // Panel height
            triggerHook: 0.7, // Middle of the viewport
        })
        .setPin(panel)
        .addTo(controller);
    });
});
