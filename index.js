document.addEventListener("DOMContentLoaded", () => {

    // document.getElementById('goBackButton').addEventListener('click', function() {
    //     chrome.tabs.update({ url: 'chrome-search://local-ntp/local-ntp.html' });
    // });
    // 저장된 언어 불러오기
    chrome.storage.sync.get("language", (data) => {
        const language = data.language || "ko"; // 기본값: 한국어
        updateLanguage(language);
    });

    setTimeout(() => {
        // 페이지 로딩 후 잠깐 delay 주고 transition을 활성화
        document.querySelector(".slider").classList.add('transition-enabled');
        document.querySelector("#language-label").style.transition = "0.4s"; 
    }, 10);


    const languageSwitch = document.getElementById("language-switch");
    const languageLabel = document.getElementById("language-label");

    // 언어 토글 상태에 따라 텍스트 변경
    languageSwitch.addEventListener("change", () => {
        const newLanguage = languageSwitch.checked ? "en" : "ko";
        chrome.storage.sync.set({ language: newLanguage }, () => {
            updateLanguage(newLanguage);
        });
        
    });

    // 언어 변경 함수
    function updateLanguage(lang) {
        languageSwitch.checked = lang !== "ko";
        if (lang === "ko") {
            languageLabel.textContent = "한국어"; // 한국어로 변경
        } else {
            languageLabel.textContent = "English"; // 영어로 변경
        }
        isKor = lang === "ko";
        if (curData != null)
            setHtml();
    }

    const errPhrase = {
        data: [
            {
                ko: "404 Not Found",
                who_ko: "app",
                en: "404 Not Found",
                who_en: "app",
                img: "",
            },
        ],
    };

    async function loadLocalJson() {
        try {
            const response = await fetch(chrome.runtime.getURL("data.json"));
            if (!response.ok) return errPhrase;
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("JSON 파일 로드 중 오류 발생:", error);
        }
    }

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    let isKor = true;
    let curData;

    async function getRandomPhrase() {
        const data = await loadLocalJson();
        
        curData = getRandomElement(data["data"]);

        setHtml();
    }

    function setHtml(){
        if(curData == null) return;
        const content = document.querySelector("#content");
        const who = document.querySelector("#who");

        if (curData.hasOwnProperty("img") && curData["img"] != "") {
            document.querySelector(".quote-container").classList.add("hasImg");
            const imgTag = document.querySelector("#whoImg");
            imgTag.setAttribute("src", curData["img"]);
            imgTag.onload = () => {
                imgTag.classList.add("loaded"); // CSS 애니메이션 적용
            };

            // 캐시된 이미지 처리 (이미 로드된 경우)
            if (imgTag.complete) {
                imgTag.classList.add("loaded");
            }
        }

        content.innerHTML = '"' + curData[isKor ? "ko" : "en"] + '"';
        who.innerHTML = "- " + curData[isKor ? "who_ko" : "who_en"] + " -";
    }

    getRandomPhrase();
});
