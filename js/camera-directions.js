// Модуль управления направлениями камер
const cameraDirections = {
    currentDirectionIndex: 0,
    
    // Добавление направления к камере
    addDirectionToCamera: function(pointData) {
        if (!pointData || (pointData.type !== 'camera' && pointData.type !== 'pole_with_camera')) {
            alert("Камеры доступны только для точек типа 'Камера' или 'POE коробка с камерой'");
            return;
        }
        
        // Проверяем максимальное количество направлений (4)
        if (!pointData.directions) {
            pointData.directions = [];
        }
        
        if (pointData.directions.length >= 4) {
            alert("Максимальное количество камер - 4");
            return;
        }
        
        // Создаем новое направление (по умолчанию 0 градусов)
        const newDirection = {
            id: Date.now() + Math.random(),
            angle: 0, // угол в градусах
            object: null // объект на карте
        };
        
        pointData.directions.push(newDirection);
        this.updateCameraDirection(pointData, newDirection);
        ui.updateStatus("Добавлена камера. Текущее количество: " + pointData.directions.length);
        
        // Обновляем интерфейс и статистику
        points.updatePointManagementUI();
        ui.updateStats();
    },
    
    // Удаление направления камеры
    removeDirectionFromCamera: function(pointData) {
        if (!pointData || !pointData.directions || pointData.directions.length === 0) {
            alert("Нет камер для удаления");
            return;
        }
        
        // Удаляем последнее направление
        const removedDirection = pointData.directions.pop();
        
        // Удаляем объект с карты
        if (removedDirection.object) {
            mapModule.getMap().geoObjects.remove(removedDirection.object);
        }
        
        ui.updateStatus("Удалена камера. Осталось: " + pointData.directions.length);
        
        // Обновляем интерфейс и статистику
        points.updatePointManagementUI();
        ui.updateStats();
    },
    
    // Удалить конкретное направление
    removeSpecificDirection: function(directionIndex) {
        if (!points.selectedPoint || !points.selectedPoint.directions) {
            return;
        }
        
        if (directionIndex < 0 || directionIndex >= points.selectedPoint.directions.length) {
            alert('Неверный номер камеры');
            return;
        }
        
        if (confirm(`Удалить камеру ${directionIndex + 1}?`)) {
            const removedDirection = points.selectedPoint.directions[directionIndex];
            
            // Удаляем объект с карты
            if (removedDirection.object) {
                mapModule.getMap().geoObjects.remove(removedDirection.object);
            }
            
            // Удаляем направление из массива
            points.selectedPoint.directions.splice(directionIndex, 1);
            
            ui.updateStatus("Удалена камера " + (directionIndex + 1));
            
            // Обновляем интерфейс и статистику
            points.updatePointManagementUI();
            ui.updateStats();
        }
    },
    
    // Обновить угол направления в реальном времени
    updateDirectionAngle: function(directionIndex, angle) {
        if (!points.selectedPoint || !points.selectedPoint.directions) {
            return;
        }
        
        // Обновляем значение угла в интерфейсе
        const angleValueElement = document.getElementById('angleValue' + directionIndex);
        if (angleValueElement) {
            angleValueElement.textContent = angle;
        }
        
        // Обновляем направление на карте
        if (points.selectedPoint.directions[directionIndex]) {
            this.rotateDirection(points.selectedPoint, directionIndex, parseInt(angle));
        }
    },
    
    // Обновление направления камеры
    updateCameraDirection: function(pointData, direction) {
        // Удаляем старый объект если есть
        if (direction.object) {
            mapModule.getMap().geoObjects.remove(direction.object);
        }
        
        // Создаем сектор обзора 70 градусов
        const sectorCoords = this.calculateDirectionSector(pointData.coords, direction.angle, 70);
        
        // Создаем полигон сектора
        direction.object = new ymaps.Polygon([sectorCoords], {}, {
            fillColor: 'rgba(74, 144, 226, 0.3)',
            strokeColor: 'rgba(74, 144, 226, 0.8)',
            strokeWidth: 2,
            zIndex: 1 // Самый нижний слой
        });
        
        // Добавляем на карту
        mapModule.getMap().geoObjects.add(direction.object);
    },
    
    // Расчет координат сектора направления
    calculateDirectionSector: function(centerCoords, angle, sectorWidth) {
        const centerLat = centerCoords[0];
        const centerLon = centerCoords[1];
        const radius = 0.0007; // Уменьшил радиус в 3 раза (было 0.002)
        
        const startAngle = angle - sectorWidth / 2;
        const endAngle = angle + sectorWidth / 2;
        
        // Начальная точка - центр камеры
        const coords = [[centerLat, centerLon]];
        
        // Добавляем точки по окружности для сектора
        const steps = 20;
        for (let i = 0; i <= steps; i++) {
            const currentAngle = startAngle + (endAngle - startAngle) * (i / steps);
            const rad = currentAngle * Math.PI / 180;
            
            const lat = centerLat + radius * Math.cos(rad);
            const lon = centerLon + radius * Math.sin(rad);
            
            coords.push([lat, lon]);
        }
        
        // Замыкаем полигон
        coords.push([centerLat, centerLon]);
        
        return coords;
    },
    
    // Поворот направления
    rotateDirection: function(pointData, directionIndex, newAngle) {
        if (!pointData.directions || !pointData.directions[directionIndex]) {
            return;
        }
        
        pointData.directions[directionIndex].angle = newAngle;
        this.updateCameraDirection(pointData, pointData.directions[directionIndex]);
    },
    
    // Удаление всех направлений камеры
    removeAllDirections: function(pointData) {
        if (!pointData.directions) return;
        
        pointData.directions.forEach(direction => {
            if (direction.object) {
                mapModule.getMap().geoObjects.remove(direction.object);
            }
        });
        
        pointData.directions = [];
    },
    
    // Обновление всех направлений при перемещении камеры
    updateAllDirections: function(pointData) {
        if (!pointData.directions) return;
        
        pointData.directions.forEach(direction => {
            this.updateCameraDirection(pointData, direction);
        });
    }
};