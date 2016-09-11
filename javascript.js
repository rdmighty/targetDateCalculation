(function(){
	var _activeDays = ['isSundayActive', 'isMondayActive', 'isTuesdayActive', 'isWednesdayActive', 'isThursdayActive', 'isFridayActive', 'isSaturdayActive'];
	var hoursActive = {
		isSundayActive: false, 
		isMondayActive: true,
		isTuesdayActive: true,
		isWednesdayActive: false,
		isThursdayActive: false,
		isFridayActive: false,
		isSaturdayActive: true
	};
	
	hoursActive.weekdayActiveFrom = new Date("11 Sep 2016 8:30 AM");
	hoursActive.weekdayActiveTo = new Date("11 Sep 2016 4:30 PM") ;
	hoursActive.weekendActiveFrom = new Date("11 Sep 2016 10:05 AM");
	hoursActive.weekendActiveTo = new Date("11 Sep 2016 06:30 PM") ;
	
	function isWeekendDay(day){ return (day == 0 || day == 6) ? true : false; }
	function isWeekend(date) { return isWeekendDay(moment(date).day()); } 
	function isWeekdayValid(date){return hoursActive[_activeDays[moment(date).day()]];}
	function isTimerangeValid(date){
		var activeFrom = null, activeTo = null;
		if(isWeekend(date)){
			activeFrom = hoursActive.weekendActiveFrom;
			activeTo = hoursActive.weekendActiveTo;
		}else{
			activeFrom = hoursActive.weekdayActiveFrom;
			activeTo = hoursActive.weekdayActiveTo;
		}
		return (nMinutes(activeFrom) <= nMinutes(date) && nMinutes(date) <= nMinutes(activeTo)) ? true : false;
	}	
	function nMinutes(date){var cloned = moment(date);return (cloned.minutes() + cloned.hours()*60);}
	function diffInMinutes(from, to){ return Math.abs(nMinutes(from) - nMinutes(to));}
	function getDifferenceInMinutes(date){return isWeekend(date) ? diffInMinutes(hoursActive.weekendActiveTo, date) : diffInMinutes(hoursActive.weekdayActiveTo, date);}
	function getNextActiveValidDay(date){
		var cloned = moment(date);
		var count = 0;
		do { cloned = cloned.add(1, 'days');} 
		while(!isWeekdayValid(cloned) && count ++ < 7);
		return isWeekend(cloned) ? copyHoursMinutesAndSeconds(hoursActive.weekendActiveFrom, cloned) : copyHoursMinutesAndSeconds(hoursActive.weekdayActiveFrom, cloned);
	}
	function copyHoursMinutesAndSeconds(fromDate, toDate){
		fromDate = moment(fromDate);
		toDate.hour(fromDate.hours());
		toDate.minute(fromDate.minutes());
		toDate.second(fromDate.seconds());	
		return toDate;		
	}
	
	function calculateRequestTargetDate(hours, createdDate){
		console.log("Created Date: "+moment(createdDate)._d);
		var clonedCreatedDate = moment(createdDate) ;
		
		if(!isWeekdayValid(clonedCreatedDate))
			clonedCreatedDate = getNextActiveValidDay(clonedCreatedDate);
			
		for(var i = 0 ; i < hours ; i ++){
			clonedCreatedDate.add(1, 'hours');
			
			//if not an valid day then find the next active day possible
			if(!isWeekdayValid(clonedCreatedDate))
				clonedCreatedDate = getNextActiveValidDay(clonedCreatedDate);
			else{
				//if it's a valid day then check to find the validity of time range
				//if the time range is not valid then find the next active day and add the difference in time from 'to' time
				if(!isTimerangeValid(clonedCreatedDate)){
					do {
						var diffInMinutes = getDifferenceInMinutes(clonedCreatedDate);
						clonedCreatedDate = getNextActiveValidDay(clonedCreatedDate);
						clonedCreatedDate.add(diffInMinutes, 'minutes');
					}while(!isTimerangeValid(clonedCreatedDate));					
				}
			}			
		}
		
		console.log("Target Date: "+clonedCreatedDate._d);
		return clonedCreatedDate;
	}
	
	
	
	calculateRequestTargetDate(120, moment()._d);
	
})();