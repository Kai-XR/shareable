export const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};
export const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isAndroid = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const Android = userAgent.indexOf("android") > -1;
  return Android;
};

export const isTabletNotIPad = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  // const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent)
  const isTablet =
    /(tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
      userAgent
    );
  return isTablet;
};

export const isMobileVRBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileVRBrowser =
    userAgent.indexOf("oculus") > -1 || userAgent.indexOf("mobile vr") > -1;

  return mobileVRBrowser;
};

export const isMobile = () => {
  return (
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1
  );
};

export const capitalizeFirstLetter = (string) => {
  if (string !== undefined && string.length) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  } else {
    return "";
  }
};

export function copyToClipboard(str) {
  if (!navigator.clipboard) {
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  } else {
    navigator.clipboard.writeText(str);
  }
}

export function formatNumber(number) {
  if (number < 10 && number < 100) {
    return "0" + number;
  } else {
    return number;
  }
}

export function getObject(object, key, value, single = false) {
  const iteration = (object, key, value) => {
    if (key) {
      let filteredObject = {};
      for (var key2 in object) {
        const match = stringToPath(object[key2], key);
        if (String(match) === String(value)) {
          filteredObject[key2] = object[key2];
        }
      }
      if (single) {
        const keys = Object.keys(filteredObject);
        return keys.length ? filteredObject[keys[0]] : filteredObject;
      } else {
        return filteredObject;
      }
    } else {
      return object;
    }
  };

  const stringToPath = (object, path) => {
    let output;
    const loop = (object, arr) => {
      const key = arr.shift();
      if (object) {
        output = value(object, key);
        if (typeof output === "object") {
          loop(output, arr);
        }
      }
    };
    const value = (object, path) => {
      return object[path];
    };
    loop(object, path.split("."));
    return output;
  };

  return iteration(object, key, value);
}
