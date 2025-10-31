// Модуль управления точками
const points = {
    points: [],
    selectedPoint: null,
    
    // Добавление точки на карту
    addPointToMap: function(coords, type) {
        console.log("Добавляем точку на карту:", type, coords);
        const name = utils.generateName(type);
        const pointData = this.createPoint(coords, type, name);
        
        this.points.push(pointData);
        ui.updateStats();
        ui.updateStatus("Добавлена точка: " + name);
    },

    // Создание точки
    createPoint: function(coords, type, name) {
        console.log("Создаем точку:", name, type);
        
        // ИСПОЛЬЗУЕМ SVG ИКОНКИ
        const icons = {
            camera: svgIcons.getIcon('camera'),
            box: svgIcons.getIcon('box'), 
            optical: svgIcons.getIcon('optical'),
            pole: svgIcons.getIcon('pole'),
            pole_with_camera: svgIcons.getIcon('pole_with_camera')
        };

        const selectedIcons = {
            camera: svgIcons.getIcon('camera_selected'),
            box: svgIcons.getIcon('box_selected'), 
            optical: svgIcons.getIcon('optical_selected'),
            pole: svgIcons.getIcon('pole_selected'),
            pole_with_camera: svgIcons.getIcon('pole_with_camera_selected')
        };
        
        // СОЗДАЕМ ОСНОВНУЮ МЕТКУ (БЕЗ ТЕКСТА)
        const placemark = new ymaps.Placemark(coords, {
            balloonContent: name,
            hintContent: name
        }, {
            iconLayout: 'default#image',
            iconImageHref: icons[type],
            iconImageSize: [24, 24],
            iconImageOffset: [-12, -12],
            zIndex: 100,
            hideIconOnBalloonOpen: false,
            balloonCloseButton: false,
            draggable: true
        });
        
        // СОЗДАЕМ ОТДЕЛЬНУЮ МЕТКУ ДЛЯ ТЕКСТА НАЗВАНИЯ
        const textLabel = new ymaps.Placemark(coords, {
            iconContent: name,
            background: this.getBackgroundColor(type),
            borderColor: this.getBorderColor(type)
        }, {
            iconLayout: 'default#imageWithContent',
            iconImageHref: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
            iconImageSize: [1, 1],
            iconImageOffset: [0, -35],
            iconContentLayout: ymaps.templateLayoutFactory.createClass(
                `<div style="
                    background: {{ properties.background }};
                    border: 2px solid {{ properties.borderColor }};
                    border-radius: 15px;
                    color: white;
                    font-size: 11px;
                    font-family: Arial, sans-serif;
                    font-weight: bold;
                    text-align: center;
                    padding: 4px 8px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                    line-height: 1.2;
                    white-space: nowrap;
                    display: inline-block;
                    opacity: 0.9;
                ">{{ properties.iconContent }}</div>`
            ),
            zIndex: 99,
            hideIconOnBalloonOpen: false,
            balloonCloseButton: false
        });
        
        mapModule.getMap().geoObjects.add(placemark);
        mapModule.getMap().geoObjects.add(textLabel);
        
        // Сохраняем данные точки
        const pointData = {
            coords: coords,
            type: type,
            name: name,
            placemark: placemark,
            textLabel: textLabel,
            normalIcon: icons[type],
            selectedIcon: selectedIcons[type],
            directions: [] // Массив направлений для камер
        };
        
        // Обработчик клика для выбора точки
        placemark.events.add('click', (e) => {
            console.log("Клик по точке:", name, "Режим линии:", lines.currentLineType);
            e.preventDefault();
            
            // ЕСЛИ РЕЖИМ ЛИНИИ - ДОБАВЛЯЕМ ТОЧКУ В ЛИНИЮ
            if (lines.currentLineType) {
                console.log("Добавляем точку в линию из клика");
                lines.addPointToLine(coords);
            } else {
                // ЕСЛИ НЕ РЕЖИМ ЛИНИИ - ВЫБИРАЕМ ТОЧКУ
                this.selectPoint(pointData);
            }
        });
        
        // Также обрабатываем клик по текстовой метке
        textLabel.events.add('click', (e) => {
            console.log("Клик по тексту точки:", name, "Режим линии:", lines.currentLineType);
            e.preventDefault();
            
            // ЕСЛИ РЕЖИМ ЛИНИИ - ДОБАВЛЯЕМ ТОЧКУ В ЛИНИЮ
            if (lines.currentLineType) {
                console.log("Добавляем точку в линию из клика по тексту");
                lines.addPointToLine(coords);
            } else {
                // ЕСЛИ НЕ РЕЖИМ ЛИНИИ - ВЫБИРАЕМ ТОЧКУ
                this.selectPoint(pointData);
            }
        });
        
        // Обработчик перемещения точки
        placemark.events.add('dragend', (e) => {
            const newCoords = placemark.geometry.getCoordinates();
            pointData.coords = newCoords;
            textLabel.geometry.setCoordinates(newCoords);
            
            // Обновляем направления если это камера или POE коробка с камерой
            if ((type === 'camera' || type === 'pole_with_camera') && pointData.directions && pointData.directions.length > 0) {
                cameraDirections.updateAllDirections(pointData);
            }
            
            ui.updateStatus("Точка перемещена: " + name);
        });
        
        return pointData;
    },

    // Выбор точки
    selectPoint: function(pointData) {
        console.log("Выбрана точка:", pointData.name);
        
        // Снимаем выделение с предыдущей точки
        if (this.selectedPoint && this.selectedPoint !== pointData) {
            this.deselectPoint(this.selectedPoint);
        }
        
        this.selectedPoint = pointData;
        this.highlightPoint(pointData);
        
        // Обновляем интерфейс управления точками
        this.updatePointManagementUI();
        
        ui.updateStatus("Выбрана точка: " + pointData.name);
    },

    // Обновить интерфейс управления точками
    updatePointManagementUI: function() {
        const pointManagement = document.getElementById('pointManagement');
        
        if (!this.selectedPoint) {
            pointManagement.innerHTML = `
                <button class="btn btn-rename" onclick="points.renameSelectedPoint()">Переименовать выбранную точку</button>
                <button class="btn btn-delete" onclick="points.deleteSelectedPoint()">Удалить выбранную точку</button>
            `;
            return;
        }
        
        // Если выбрана камера или POE коробка с камерой - показываем управление направлениями
        if (this.selectedPoint.type === 'camera' || this.selectedPoint.type === 'pole_with_camera') {
            const directionCount = this.selectedPoint.directions ? this.selectedPoint.directions.length : 0;
            const directionsList = this.generateDirectionsList();
            
            pointManagement.innerHTML = `
                <div style="margin-bottom: 10px;">
                    <strong>Управление ${this.selectedPoint.type === 'camera' ? 'камерой' : 'POE коробкой с камерой'}: ${this.selectedPoint.name}</strong>
                </div>
                <button class="btn btn-rename" onclick="points.renameSelectedPoint()">Переименовать</button>
                <button class="btn btn-delete" onclick="points.deleteSelectedPoint()">Удалить</button>
                
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                    <strong>Управление камерами:</strong>
                    <div class="btn-group-vertical" style="margin-top: 8px; margin-bottom: 15px;">
                        <button class="btn" onclick="cameraDirections.addDirectionToCamera(points.selectedPoint)">
                            Добавить камеру (${directionCount}/4)
                        </button>
                        <button class="btn" onclick="cameraDirections.removeDirectionFromCamera(points.selectedPoint)">
                            Удалить последнюю камеру
                        </button>
                    </div>
                    
                    <div id="directionsList">
                        ${directionsList}
                    </div>
                </div>
            `;
        } else {
            // Для других типов точек - обычное управление
            pointManagement.innerHTML = `
                <button class="btn btn-rename" onclick="points.renameSelectedPoint()">Переименовать выбранную точку</button>
                <button class="btn btn-delete" onclick="points.deleteSelectedPoint()">Удалить выбранную точку</button>
            `;
        }
    },

    // Генерация списка направлений
    generateDirectionsList: function() {
        if (!this.selectedPoint.directions || this.selectedPoint.directions.length === 0) {
            return '<div style="color: #666; font-style: italic; text-align: center; padding: 10px;">Нет добавленных камер</div>';
        }
        
        let directionsHTML = '<div style="max-height: 200px; overflow-y: auto;">';
        
        this.selectedPoint.directions.forEach((direction, index) => {
            directionsHTML += `
                <div class="direction-item" style="padding: 10px; margin-bottom: 8px; background: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong>Камера ${index + 1}</strong>
                        <button class="btn btn-small" onclick="cameraDirections.removeSpecificDirection(${index})" style="background: #dc3545; color: white; padding: 2px 6px; font-size: 11px;">
                            Удалить
                        </button>
                    </div>
                    <div class="angle-control">
                        <label style="display: block; margin-bottom: 5px; font-size: 12px;">Угол: <span id="angleValue${index}">${direction.angle}</span>°</label>
                        <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            value="${direction.angle}" 
                            oninput="cameraDirections.updateDirectionAngle(${index}, this.value)"
                            style="width: 100%; height: 6px; border-radius: 3px; background: #e9ecef; outline: none; appearance: none;"
                            onchange="cameraDirections.updateDirectionAngle(${index}, this.value)"
                        >
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #666; margin-top: 2px;">
                            <span>0°</span>
                            <span>180°</span>
                            <span>360°</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        directionsHTML += '</div>';
        return directionsHTML;
    },

    // Выделить точку
    highlightPoint: function(pointData) {
        pointData.placemark.options.set('iconImageHref', pointData.selectedIcon);
    },

    // Снять выделение с точки
    deselectPoint: function(pointData) {
        pointData.placemark.options.set('iconImageHref', pointData.normalIcon);
    },

    // Переименовать точку
    renameSelectedPoint: function() {
        if (!this.selectedPoint) {
            alert('Сначала выберите точку кликом по ней');
            return;
        }
        
        const newName = prompt('Введите новое название для точки:', this.selectedPoint.name);
        if (newName && newName.trim() !== '') {
            const trimmedName = newName.trim();
            // ОБНОВЛЯЕМ НАЗВАНИЕ ВО ВСЕХ МЕСТАХ
            this.selectedPoint.placemark.properties.set({
                balloonContent: trimmedName,
                hintContent: trimmedName
            });
            this.selectedPoint.textLabel.properties.set({
                iconContent: trimmedName
            });
            this.selectedPoint.name = trimmedName;
            ui.updateStats();
            ui.updateStatus("Точка переименована: " + trimmedName);
            
            // Обновляем интерфейс
            this.updatePointManagementUI();
        }
    },

    // Удалить точку
    deleteSelectedPoint: function() {
        if (!this.selectedPoint) {
            alert('Сначала выберите точку кликом по ней');
            return;
        }
        
        if (confirm('Удалить точку "' + this.selectedPoint.name + '"?')) {
            // Удаляем направления если это камера или POE коробка с камерой
            if (this.selectedPoint.type === 'camera' || this.selectedPoint.type === 'pole_with_camera') {
                cameraDirections.removeAllDirections(this.selectedPoint);
            }
            
            mapModule.getMap().geoObjects.remove(this.selectedPoint.placemark);
            mapModule.getMap().geoObjects.remove(this.selectedPoint.textLabel);
            
            const index = this.points.indexOf(this.selectedPoint);
            if (index > -1) {
                this.points.splice(index, 1);
            }
            
            ui.updateStats();
            ui.updateStatus("Точка удалена: " + this.selectedPoint.name);
            this.selectedPoint = null;
            
            // Обновляем интерфейс
            this.updatePointManagementUI();
        }
    },

    // Функции для определения цветов
    getBackgroundColor: function(type) {
        const colors = {
            'camera': 'rgba(51, 51, 51, 0.9)',      // черный с прозрачностью
            'box': 'rgba(51, 51, 51, 0.9)',         // черный с прозрачностью
            'optical': 'rgba(255, 68, 68, 0.9)',    // красный с прозрачностью
            'pole': 'rgba(51, 51, 51, 0.9)',        // черный с прозрачностью
            'pole_with_camera': 'rgba(74, 144, 226, 0.9)' // синий с прозрачностью
        };
        return colors[type] || 'rgba(51, 51, 51, 0.9)';
    },

    getBorderColor: function(type) {
        const colors = {
            'camera': '#000000',      // черный
            'box': '#000000',         // черный
            'optical': '#CC0000',     // темно-красный
            'pole': '#000000',        // черный
            'pole_with_camera': '#2C6FB7' // темно-синий
        };
        return colors[type] || '#000000';
    },

    // Получить все точки
    getAllPoints: function() {
        return this.points;
    }
};