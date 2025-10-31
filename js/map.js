// Модуль работы с картой
const mapModule = {
    myMap: null,
    
    // Инициализация карты
    init: function() {
        console.log("Инициализация карты...");
        
        // Определяем начальный центр и зум для мобильных
        const isMobile = window.innerWidth <= 768;
        const initialCenter = isMobile ? [55.76, 37.64] : [55.76, 37.64];
        const initialZoom = isMobile ? 13 : 15;
        
        // Создаем карту
        this.myMap = new ymaps.Map("map", {
            center: initialCenter,
            zoom: initialZoom
        });

        window.myMap = this.myMap;
        console.log("Карта создана! Мобильный:", isMobile);

        // Обработчик клика на карту
        this.myMap.events.add('click', function (e) {
            console.log("Клик по карте", app.currentMode, lines.currentLineType);
            
            // Сбрасываем выбранную точку при клике на пустое место
            if (points.selectedPoint) {
                points.deselectPoint(points.selectedPoint);
                points.selectedPoint = null;
                points.updatePointManagementUI();
            }
            
            // Обрабатываем добавление точек/линий
            if (lines.currentLineType) {
                console.log("Добавляем точку в линию");
                lines.addPointToLine(e.get('coords'));
            } else if (app.currentMode) {
                console.log("Добавляем точку", app.currentMode);
                points.addPointToMap(e.get('coords'), app.currentMode);
            }
        });
    },

    // Получение экземпляра карты
    getMap: function() {
        return this.myMap;
    },
    
    // Функция для адаптации под мобильные
    adaptToMobile: function() {
        if (window.innerWidth <= 768) {
            this.myMap.behaviors.enable('multiTouch');
            this.myMap.behaviors.enable('drag');
        }
    }
};