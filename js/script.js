window.addEventListener("DOMContentLoaded", () => {
  // CSS value
  const animTime =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--anim")
    ) * 1000;

  // Page elements
  const timerContainerRow = document.querySelector(".row");

  // JS variables
  const timerForm = `<div class="event-name-form">
                        <div class="timer-header">Event name</div>
                        <input type="text" class="event-name-input" />
                    </div>
                    <div class="event-deadline-form">
                        <div class="timer-header">Deadline</div>
                        <div class="event-deadline-inputs">
                            <input type="date" class="date-input" />
                            <input type="time" class="time-input" />
                        </div>
                    </div>
                    <button class="timer-btn submit-btn">Submit</button>`;

  let timersData = localStorage.getItem("timersData") ?? {};
  if (timersData === "{}") {
    timersData = {};
  }

  // Functions
  const wrong = (elem) => {
    elem.classList.add("wrong");
    setTimeout(() => {
      elem.classList.remove("wrong");
    }, animTime);
  };

  const checkEmpty = (arrOfElems) => {
    arrOfElems.forEach((elem) => {
      if (!elem.value) {
        wrong(elem);
      }
    });
  };

  const save = () => {
    localStorage.setItem("timersData", JSON.stringify(timersData));
  };

  const deleteData = (key) => {
    delete timersData[key];
    save();
  };

  // Class
  class Timer {
    constructor(name, date, time = "00:00") {
      this.name = name;
      this.deadline = new Date(`${date}T${time}:00`);
      [this.intervalId, this.timerElement, this.timeFieldElement] =
        this.createElement();
      timersData[this.name] = [date, time];
      save();
    }

    createElement() {
      const timerContainers = document.querySelectorAll(".timer-container");
      const timerElement = timerContainers[timerContainers.length - 1];

      timerElement.innerHTML = `
      <div class="timer">
        <div class="timer-header">${this.name}</div>
        <div class="timer-time"></div>
        <button class="timer-btn delete-btn">Delete</button>
      </div>`;

      const timeFieldElement = timerElement.querySelector(".timer-time");
      const deleteBtn = timerElement.querySelector(".delete-btn");

      const interval = setInterval(() => {
        const dif = this.deadline - new Date();

        if (dif > 0) {
          const seconds = Math.floor((dif / 1000) % 60);
          const minutes = Math.floor((dif / 1000 / 60) % 60);
          const hours = Math.floor((dif / 1000 / 60 / 60) % 24);
          const days = Math.floor(dif / 1000 / 60 / 60 / 24);

          timeFieldElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
          this.stop();
        }
      }, 1000);

      deleteBtn.addEventListener("click", () => {
        this.delete();
      });

      return [interval, timerElement, timeFieldElement];
    }

    static createAddTimer() {
      const col4 = document.createElement("div");
      col4.classList.add("col-12", "col-md-6", "col-lg-4", "timer-container");

      const elementTimerClass = document.createElement("div");
      elementTimerClass.classList.add("timer", "timer-new");

      col4.appendChild(elementTimerClass);
      timerContainerRow.appendChild(col4);
    }

    stop() {
      clearInterval(this.intervalId);
    }

    delete() {
      this.stop();
      this.timerElement.remove();
      deleteData(this.name);
    }
  }

  // Event listeners
  timerContainerRow.addEventListener("click", (e) => {
    if (e.target.classList.contains("timer-new")) {
      e.target.classList.remove("timer-new");
      e.target.classList.add("timer-form");
      e.target.innerHTML = timerForm;
    } else if (e.target.classList.contains("submit-btn")) {
      const eventNameInp = document.querySelector(".event-name-input");
      const dateInp = document.querySelector(".date-input");
      const timeInp = document.querySelector(".time-input");

      if (eventNameInp.value && dateInp.value) {
        if (timeInp.value) {
          new Timer(eventNameInp.value, dateInp.value, timeInp.value);
        } else {
          new Timer(eventNameInp.value, dateInp.value);
        }
        Timer.createAddTimer();
      } else {
        checkEmpty([eventNameInp, dateInp]);
      }
    }
  });

  // Code
  if (typeof timersData === "string") {
    timersData = JSON.parse(timersData);
    for (let key in timersData) {
      new Timer(key, timersData[key][0], timersData[key][1]);
      Timer.createAddTimer();
    }
  }
});
