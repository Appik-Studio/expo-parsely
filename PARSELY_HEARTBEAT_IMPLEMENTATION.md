# Parse.ly useful links

- https://docs.parse.ly/engaged-time/
- https://docs.parse.ly/ios-sdk/
- https://docs.parse.ly/android-sdk/
- https://github.com/Appik-Studio/expo-parsely

# Parse.ly Heartbeat Implementation: Design Decisions & Documentatio

## 📖 Parse.ly Official Documentation

### Core Methodology

Parse.ly defines engagement using this formula:


Source: [Parse.ly Engaged Time Documentation](https://docs.parse.ly/engaged-time/)

### Key Quotes from Official Documentation

#### 1. Scroll Events ARE Engagement

> _"The Parse.ly bundle tracks interaction by listening to a number of common browser events that indicate movement on the page: `click`, **`scroll`**, `mouseup`, `mousedown`, `focus`, `touchstart`, `touchend`, and many more."_

**Source**: [https://docs.parse.ly/engaged-time/](https://docs.parse.ly/engaged-time/)

#### 2. Activity Timeout Standard

> _"`activeTimeout` - The number of seconds after an interaction event that the user is considered to still be engaged with the webpage. **Defaults to 5**."_

**Source**: [https://docs.parse.ly/engaged-time/](https://docs.parse.ly/engaged-time/)

#### 3. Heartbeat Debouncing

> _"`secondsBetweenHeartbeats` - The number of seconds to wait between sending heartbeat events. **Defaults to 150**. If a number less than the default is specified, it is ignored."_

**Source**: [https://docs.parse.ly/engaged-time/](https://docs.parse.ly/engaged-time/)

#### 4. Engagement Formula Application

> _"It notes how long there has been engagement with the page and sends Parse.ly's systems a number indicating that length of time **every few seconds**. By default, this timeout is set to **150 seconds**"_

**Source**: [https://docs.parse.ly/engaged-time/](https://docs.parse.ly/engaged-time/)

---

