// Модуль управления линиями
const lines = {
    lines: [],
    currentLinePoints: [],
    currentLineType: null,
    tempLine: null,
    
    // Начать рисование линии
    startLine: function(lineType) {
        console.log("Начинаем линию:", lineType);
        this.currentLineType = lineType;
        this.currentLinePoints = [];
        app.currentMode = null;
        points.selectedPoint = null;
        points.updatePointManagementUI();
        ui.updateStatus("Режим: " + utils.getTypeName(lineType) + ". Кликайте на карту чтобы добавить точки линии.");
    },

    // Добавить точку в линию
    addPointToLine: function(coords) {
        console.log("Добавляем точку в линию:", coords);
        this.currentLinePoints.push(coords);
        
        // Обновляем временную линию
        if (this.tempLine) {
            mapModule.getMap().geoObjects.remove(this.tempLine);
        }
        
        this.tempLine = new ymaps.Polyline(this.currentLinePoints, {}, {
            strokeColor: this.currentLineType === 'optical_line' ? '#FF0000' : '#000000',
            strokeWidth: 5,
            strokeOpacity: 0.9
        });
        
        mapModule.getMap().geoObjects.add(this.tempLine);
        ui.updateStatus("Добавлено точек: " + this.currentLinePoints.length + ". Нажмите 'Завершить линию' когда закончите.");
    },

    // Завершить линию
    finishLine: function() {
        if (this.currentLinePoints.length < 2) {
            alert('Добавьте хотя бы 2 точки для линии');
            return;
        }
        
        console.log("Завершаем линию с", this.currentLinePoints.length, "точками");
        
        // Создаем финальную линию
        const finalLine = new ymaps.Polyline(this.currentLinePoints, {}, {
            strokeColor: this.currentLineType === 'optical_line' ? '#FF0000' : '#000000',
            strokeWidth: 5,
            strokeOpacity: 0.9
        });
        
        // Вычисляем длину линии
        const totalDistance = utils.calculateLineDistance(this.currentLinePoints);
        
        // Находим точку на самой линии
        const middlePoint = utils.getMiddlePointOnLine(this.currentLinePoints);
        
        // ОПРЕДЕЛЯЕМ ЦВЕТА ДЛЯ МЕТКИ
        const backgroundColor = this.currentLineType === 'optical_line' ? '#FF4444' : '#333333';
        const borderColor = this.currentLineType === 'optical_line' ? '#CC0000' : '#000000';
        
        // СОЗДАЕМ КРАСИВУЮ ТЕКСТОВУЮ МЕТКУ
        const distanceLabel = new ymaps.Placemark(middlePoint, {
            iconContent: totalDistance.toFixed(1) + ' м'
        }, {
            // СОЗДАЕМ КАСТОМНЫЙ ЛЕЙАУТ ДЛЯ МЕТКИ
            iconLayout: 'default#imageWithContent',
            // ПРОЗРАЧНАЯ ПОДЛОЖКА
            iconImageHref: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="90" height="34"><rect width="90" height="34" fill="transparent"/></svg>',
            iconImageSize: [90, 34],
            iconImageOffset: [-45, -17],
            // ВКЛЮЧАЕМ ВОЗМОЖНОСТЬ ПЕРЕМЕЩЕНИЯ
            draggable: true,
            // КАСТОМНЫЙ ЛЕЙАУТ ДЛЯ КРАСИВОГО ОТОБРАЖЕНИЯ
            iconContentLayout: ymaps.templateLayoutFactory.createClass(
                `<div style="
                    background: ${backgroundColor};
                    border: 2px solid ${borderColor};
                    border-radius: 15px;
                    color: white;
                    font-size: 12px;
                    font-family: Arial, sans-serif;
                    font-weight: bold;
                    text-align: center;
                    padding: 6px 12px;
                    min-width: 70px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                    line-height: 1.2;
                    white-space: nowrap;
                ">{{ properties.iconContent }}</div>`
            ),
            zIndex: 1000,
            hideIconOnBalloonOpen: false,
            balloonCloseButton: false
        });
        
        // ДОБАВЛЯЕМ НА КАРТУ
        mapModule.getMap().geoObjects.add(finalLine);
        mapModule.getMap().geoObjects.add(distanceLabel);
        
        this.lines.push({
            line: finalLine,
            points: [...this.currentLinePoints],
            type: this.currentLineType,
            distance: totalDistance,
            label: distanceLabel
        });
        
        // Очищаем временные данные
        this.cleanupLine();
        ui.updateStats();
        ui.updateStatus("Линия завершена! Длина: " + totalDistance.toFixed(2) + " метров. Вы можете перемещать метку расстояния.");
    },

    // Отмена рисования линии
    cancelLine: function() {
        console.log("Отмена рисования линии");
        this.cleanupLine();
        ui.updateStatus("Рисование линии отменено");
    },

    // Очистка временных данных линии
    cleanupLine: function() {
        if (this.tempLine) {
            mapModule.getMap().geoObjects.remove(this.tempLine);
            this.tempLine = null;
        }
        this.currentLinePoints = [];
        this.currentLineType = null;
    },

    // Получить все линии
    getAllLines: function() {
        return this.lines;
    }
};