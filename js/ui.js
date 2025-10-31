// Модуль пользовательского интерфейса
const ui = {
    // Обновление списка иконок
    updateIconList: function() {
        const iconList = document.getElementById('iconList');
        iconList.innerHTML = '';
        
        // ИСПОЛЬЗУЕМ НАШИ SVG ИКОНКИ
        const icons = {
            camera: svgIcons.getIcon('camera'),
            box: svgIcons.getIcon('box'), 
            optical: svgIcons.getIcon('optical'),
            pole: svgIcons.getIcon('pole'),
            pole_with_camera: svgIcons.getIcon('pole_with_camera')
        };
        
        const iconDescriptions = {
            camera: 'Камера',
            box: 'POE коробка',
            optical: 'Распределительная коробка',
            pole: 'Столб',
            pole_with_camera: 'POE коробка с камерой'
        };
        
        Object.entries(icons).forEach(([type, path]) => {
            const li = document.createElement('li');
            li.className = 'icon-item';
            li.innerHTML = `
                <img src="${path}" class="icon-preview" alt="${type}">
                <span>${iconDescriptions[type]}</span>
            `;
            iconList.appendChild(li);
        });
    },

    // Обновление статистики
    updateStats: function() {
        const statsList = document.getElementById('statsList');
        
        // Подсчет оборудования
        const stats = this.calculateEquipmentStats();
        
        statsList.innerHTML = `
            <div class="stats-card">
                <div class="stats-icon">📦</div>
                <div class="stats-content">
                    <div class="stats-value">${stats.totalPoeBoxes}</div>
                    <div class="stats-label">POE коробок</div>
                </div>
            </div>
            
            <div class="stats-card">
                <div class="stats-icon">📹</div>
                <div class="stats-content">
                    <div class="stats-value">${stats.totalCameras}</div>
                    <div class="stats-label">Камер</div>
                </div>
            </div>
            
            <div class="stats-card stats-card-wide">
                <div class="stats-icon">🔴</div>
                <div class="stats-content">
                    <div class="stats-value">${stats.opticalLength}</div>
                    <div class="stats-label">Оптический кабель</div>
                </div>
            </div>
            
            <div class="stats-card stats-card-wide">
                <div class="stats-icon">⚫</div>
                <div class="stats-content">
                    <div class="stats-value">${stats.ethernetLength}</div>
                    <div class="stats-label">Витая пара</div>
                </div>
            </div>
        `;
    },

    // Расчет статистики оборудования
    calculateEquipmentStats: function() {
        const allPoints = points.getAllPoints();
        const allLines = lines.getAllLines();
        
        let totalPoeBoxes = 0;
        let totalCameras = 0;
        
        // Подсчет POE коробок и камер
        allPoints.forEach(point => {
            if (point.type === 'box') {
                totalPoeBoxes += 1;
            } else if (point.type === 'pole_with_camera') {
                totalPoeBoxes += 1;
                totalCameras += point.directions ? point.directions.length : 0;
            } else if (point.type === 'camera') {
                totalCameras += point.directions ? point.directions.length : 0;
            }
        });
        
        // Подсчет длин кабелей
        const ethernetLines = allLines.filter(line => line.type === 'ethernet_line');
        const opticalLines = allLines.filter(line => line.type === 'optical_line');
        
        const totalEthernetLength = ethernetLines.reduce((sum, line) => sum + line.distance, 0);
        const totalOpticalLength = opticalLines.reduce((sum, line) => sum + line.distance, 0);
        
        return {
            totalPoeBoxes: totalPoeBoxes,
            totalCameras: totalCameras,
            ethernetLength: totalEthernetLength.toFixed(1) + ' м',
            opticalLength: totalOpticalLength.toFixed(1) + ' м'
        };
    },

    // Обновление статуса
    updateStatus: function(message) {
        document.getElementById('status').textContent = message;
    }
};