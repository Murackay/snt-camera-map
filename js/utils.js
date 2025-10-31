// Вспомогательные функции
const utils = {
    // Генерация имени для точки
    generateName: function(type) {
        const counters = {
            'camera': 1,
            'box': 1, 
            'optical': 1,
            'pole': 1,
            'pole_with_camera': 1
        };
        
        const names = {
            'camera': 'Камера',
            'box': 'POE коробка',
            'optical': 'Опт. коробка', 
            'pole': 'Столб',
            'pole_with_camera': 'POE коробка с камерой'
        };
        
        if (!utils.counters) utils.counters = {...counters};
        
        return names[type] + ' ' + utils.counters[type]++;
    },

    // Получение читаемого имени типа
    getTypeName: function(type) {
        const names = {
            'camera': 'Камера',
            'box': 'POE коробка', 
            'optical': 'Опт. коробка',
            'pole': 'Столб',
            'pole_with_camera': 'POE коробка с камерой',
            'optical_line': 'Оптический кабель',
            'ethernet_line': 'Витая пара'
        };
        return names[type] || 'Неизвестно';
    },

    // Расчет расстояния линии
    calculateLineDistance: function(points) {
        let totalDistance = 0;
        for (let i = 0; i < points.length - 1; i++) {
            totalDistance += ymaps.coordSystem.geo.getDistance(points[i], points[i+1]);
        }
        return totalDistance;
    },

    // Нахождение точки на линии, которая находится посередине по длине
    getMiddlePointOnLine: function(points) {
        if (points.length < 2) {
            return points[0] || [0, 0];
        }

        const totalDistance = this.calculateLineDistance(points);
        const targetDistance = totalDistance / 2;
        
        let accumulatedDistance = 0;
        
        for (let i = 0; i < points.length - 1; i++) {
            const segmentDistance = ymaps.coordSystem.geo.getDistance(points[i], points[i+1]);
            
            // Если целевая точка находится в этом сегменте
            if (accumulatedDistance + segmentDistance >= targetDistance) {
                const ratio = (targetDistance - accumulatedDistance) / segmentDistance;
                
                // Вычисляем промежуточную точку в сегменте
                const lat = points[i][0] + (points[i+1][0] - points[i][0]) * ratio;
                const lon = points[i][1] + (points[i+1][1] - points[i][1]) * ratio;
                
                return [lat, lon];
            }
            
            accumulatedDistance += segmentDistance;
        }
        
        // Если что-то пошло не так, возвращаем последнюю точку
        return points[points.length - 1];
    },

    // Старая функция (оставляем для совместимости)
    getMiddlePoint: function(point1, point2) {
        return [
            (point1[0] + point2[0]) / 2,
            (point1[1] + point2[1]) / 2
        ];
    }
};