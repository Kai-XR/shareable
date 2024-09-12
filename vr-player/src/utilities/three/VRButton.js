import cardBoardIcon from "../../../assets/images/icons/vr_glasses.svg";
class VRButton {
  static createButton(renderer, setStoreVrSession, setStoreIsVrSupported) {
    const button = document.createElement("button");

    function showEnterVR(/*device*/) {
      setStoreIsVrSupported(true);
      let currentSession = null;

      async function onSessionStarted(session) {
        session.addEventListener("end", onSessionEnded);

        await renderer.xr.setSession(session);
        //button.textContent = "EXIT VR";
        setStoreVrSession(true);
        currentSession = session;
      }

      function onSessionEnded(/*event*/) {
        currentSession.removeEventListener("end", onSessionEnded);

        //button.textContent = "ENTER VR";
        setStoreVrSession(false);
        //console.log("Exit");
        currentSession = null;
      }

      button.style.display = "";

      button.style.cursor = "pointer";
      button.style.left = "calc(50% - 25px)";
      //button.style.right = "75px";
      button.style.width = "50px";

      //button.textContent = "ENTER VR";

      button.onmouseenter = function () {
        button.style.opacity = "1.0";
      };

      button.onmouseleave = function () {
        button.style.opacity = "1.0";
      };

      button.onclick = function () {
        if (currentSession === null) {
          // WebXR's requestReferenceSpace only works if the corresponding feature
          // was requested at session creation time. For simplicity, just ask for
          // the interesting ones as optional features, but be aware that the
          // requestReferenceSpace call will fail if it turns out to be unavailable.
          // ('local' is always available for immersive sessions and doesn't need to
          // be requested separately.)

          const sessionInit = {
            optionalFeatures: [
              "local-floor",
              "bounded-floor",
              "hand-tracking",
              "layers",
            ],
          };
          navigator.xr
            .requestSession("immersive-vr", sessionInit)
            .then(onSessionStarted);
        } else {
          currentSession.end();
        }
      };
    }

    function disableButton() {
      button.style.display = "";

      button.style.cursor = "auto";
      button.style.left = "calc(50% - 75px)";
      button.style.width = "150px";

      button.onmouseenter = null;
      button.onmouseleave = null;

      button.onclick = null;
    }

    function showWebXRNotFound() {
      setStoreIsVrSupported(false);
      disableButton();

      button.textContent = "VR NOT SUPPORTED";
      button.style.display = "none";
    }

    function showVRNotAllowed(exception) {
      setStoreIsVrSupported(false);
      disableButton();

      console.warn(
        "Exception when trying to call xr.isSessionSupported",
        exception
      );

      button.textContent = "VR NOT ALLOWED";
      button.style.display = "none";
    }

    function stylizeElement(element) {
      element.style.position = "absolute";
      element.style.bottom = "10px";
      element.style.padding = "0";
      //element.style.border = "1px solid #fff";
      //element.style.borderRadius = "4px";
      //element.style.background = "rgba(0,0,0,0.1)";
      //element.style.color = "#fff";
      //element.style.font = "normal 13px sans-serif";
      element.style.textAlign = "center";
      //element.style.opacity = "0.5";
      element.style.outline = "none";
      element.style.zIndex = "999";

      const img = document.createElement("img");
      img.src = cardBoardIcon;
      img.style.width = "50px";
      element.appendChild(img);
    }

    if ("xr" in navigator) {
      button.id = "VRButton";
      button.style.display = "none";

      stylizeElement(button);

      navigator.xr
        .isSessionSupported("immersive-vr")
        .then(function (supported) {
          supported ? showEnterVR() : showWebXRNotFound();

          if (supported && VRButton.xrSessionIsGranted) {
            button.click();
          }
        })
        .catch(showVRNotAllowed);

      return button;
    } else {
      setStoreIsVrSupported(false);
      const message = document.createElement("a");

      if (window.isSecureContext === false) {
        message.href = document.location.href.replace(/^http:/, "https:");
        message.innerHTML = "WEBXR NEEDS HTTPS"; // TODO Improve message
      } else {
        message.href = "https://immersiveweb.dev/";
        message.innerHTML = "WEBXR NOT AVAILABLE";
      }

      message.style.left = "calc(50% - 90px)";
      message.style.width = "180px";
      message.style.textDecoration = "none";
      message.style.display = "none";

      stylizeElement(message);

      return message;
    }
  }

  static registerSessionGrantedListener() {
    if ("xr" in navigator) {
      // WebXRViewer (based on Firefox) has a bug where addEventListener
      // throws a silent exception and aborts execution entirely.
      if (/WebXRViewer\//i.test(navigator.userAgent)) return;

      navigator.xr.addEventListener("sessiongranted", () => {
        VRButton.xrSessionIsGranted = true;
      });
    }
  }
}

VRButton.xrSessionIsGranted = false;
VRButton.registerSessionGrantedListener();

export { VRButton };
