// tabComponent.js
class TabComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.tabs = [];
        this.init();
    }

    init() {
        this.renderTabBar();
    }

    renderTabBar() {
        const tabBar = document.createElement('div');
        tabBar.className = 'tab-bar';
        this.container.appendChild(tabBar);
    }

    openNewTab(title, url) {
        const tab = { title, url };
        this.tabs.push(tab);
        this.renderTab(tab);
    }

    renderTab(tab) {
        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.textContent = tab.title;
        tabElement.addEventListener('click', () => this.switchTab(tab));
        this.container.querySelector('.tab-bar').appendChild(tabElement);
    }

    switchTab(tab) {
        // 切换到指定标签页的逻辑
        console.log(`Switched to tab: ${tab.title}`);
    }

    closeTab(tab) {
        const index = this.tabs.indexOf(tab);
        if (index > -1) {
            this.tabs.splice(index, 1);
            this.container.querySelector('.tab-bar').removeChild(this.container.querySelector('.tab-bar').children[index]);
        }
    }
}
