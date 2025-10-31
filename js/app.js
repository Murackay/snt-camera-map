// Основной модуль приложения
const app = {
    currentMode: null,
    
    // Инициализация приложения
    init: function() {
        console.log("Инициализация приложения...");
        
        // Инициализируем карту когда Yandex Maps API загружен
        ymaps.ready(() => {
            mapModule.init();
            ui.updateIconList();
            ui.updateStats();
            ui.updateStatus("Готов к работе. Выберите тип точки или линии.");
            console.log("Приложение инициализировано!");
            
            // Адаптируем под мобильные
            mapModule.adaptToMobile();
        });
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', this.handleResize);
    },
    
    // Обработчик изменения размера окна
    handleResize: function() {
        console.log("Размер окна изменен:", window.innerWidth);
        mapModule.adaptToMobile();
    },

    // Добавление точки
    addPoint: function(type) {
        console.log("Выбран режим точки:", type);
        this.currentMode = type;
        lines.currentLineType = null;
        lines.currentLinePoints = [];
        points.selectedPoint = null; // Сбрасываем выбранную точку
        points.updatePointManagementUI(); // Обновляем интерфейс
        ui.updateStatus('Режим: ' + utils.getTypeName(type) + '. Кликните на карту чтобы добавить точку');
    }
};

// Запуск приложения когда страница загружена
document.addEventListener('DOMContentLoaded', function() {
    app.init();
});