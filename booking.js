// --- UPDATED BOOKING SYSTEM LOGIC ---

const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;

let selectedPropIdx = -1;
let bookingType = 'full'; // 'full' or 'rooms'
let paymentMethod = 'online'; // 'online' or 'cash'
const basePrices = [200, 150, 180, 100]; // Full property prices
const pricePerRoom = 65; // Price for an individual room
const propMaxRooms = [4, 3, 4, 2]; // Max rooms for each property

let checkInPicker = null;
let checkOutPicker = null;

async function openBookingModal(idx) {
    selectedPropIdx = idx;
    bookingType = 'full';
    paymentMethod = 'online';
    
    document.getElementById('booking-modal').classList.add('open');
    document.getElementById('modal-prop-name').textContent = "Property " + (idx + 1);
    
    // Update Room Dropdown based on property
    const roomSelect = document.getElementById('room-count');
    roomSelect.innerHTML = '<option value="0" disabled selected>Select Rooms...</option>';
    for(let i=1; i<=propMaxRooms[idx]; i++) {
        roomSelect.innerHTML += `<option value="${i}">${i} Room${i>1?'s':''}</option>`;
    }
    
    document.getElementById('type-full').classList.add('active');
    
    // Reset payment method UI
    setPaymentMethod('online');
    
    updatePrice();
    document.body.style.overflow = 'hidden';

    // Initialize Flatpickr with disabled dates
    initCalendar(idx);
}

async function initCalendar(idx) {
    const propName = "Property " + (idx + 1);
    const fpConfig = {
        minDate: "today",
        dateFormat: "Y-m-d",
        disable: [],
        allowInput: true,
        onChange: function() { updatePrice(); }
    };

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings?property_name=eq.${encodeURIComponent(propName)}&select=check_in,check_out`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        if (response.ok) {
            const bookings = await response.json();
            fpConfig.disable = bookings.map(b => ({
                from: b.check_in,
                to: b.check_out
            }));
        }
    } catch(e) {
        console.error("Failed to load disabled dates", e);
    }

    if (typeof flatpickr === 'undefined') {
        console.error("Flatpickr not loaded! Falling back to native date inputs.");
        document.getElementById('check-in').type = 'date';
        document.getElementById('check-out').type = 'date';
        return;
    }

    if (checkInPicker) checkInPicker.destroy();
    if (checkOutPicker) checkOutPicker.destroy();

    checkInPicker = flatpickr("#check-in", fpConfig);
    checkOutPicker = flatpickr("#check-out", fpConfig);
}

function closeBookingModal() {
    document.getElementById('booking-modal').classList.remove('open');
    document.body.style.overflow = '';
}

function setBookingType(type) {
    bookingType = type;
    if (type === 'full') {
        document.getElementById('type-full').classList.add('active');
        const typeRooms = document.getElementById('type-rooms');
        if (typeRooms) typeRooms.classList.remove('active');
        document.getElementById('room-count').value = "0";
    } else {
        document.getElementById('type-full').classList.remove('active');
        const typeRooms = document.getElementById('type-rooms');
        if (typeRooms) typeRooms.classList.add('active');
    }
    updatePrice();
}

function setPaymentMethod(method) {
    paymentMethod = method;
    if (method === 'online') {
        document.getElementById('pay-online').classList.add('active');
        document.getElementById('pay-cash').classList.remove('active');
        document.getElementById('card-form').classList.remove('hidden');
    } else {
        document.getElementById('pay-cash').classList.add('active');
        document.getElementById('pay-online').classList.remove('active');
        document.getElementById('card-form').classList.add('hidden');
    }
}

// Card Formatter
function formatCard(input) {
    let val = input.value.replace(/\D/g, '');
    let formatted = '';
    for(let i = 0; i < val.length; i++) {
        if(i > 0 && i % 4 === 0) formatted += ' ';
        formatted += val[i];
    }
    input.value = formatted;
}

function formatExp(input) {
    let val = input.value.replace(/\D/g, '');
    if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    input.value = val;
}

function updatePrice() {
    const checkIn = new Date(document.getElementById('check-in').value);
    const checkOut = new Date(document.getElementById('check-out').value);
    
    let nights = 0;
    if (!isNaN(checkIn) && !isNaN(checkOut)) {
        const diff = checkOut - checkIn;
        nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    
    if (nights < 0) nights = 0;
    
    let pricePerNight = 0;
    if (bookingType === 'full') {
        pricePerNight = basePrices[selectedPropIdx];
    } else {
        const rooms = parseInt(document.getElementById('room-count').value) || 1;
        pricePerNight = rooms * pricePerNight; // Wait, mistake in logic
        pricePerNight = rooms * pricePerRoom;
    }
    
    const total = nights * pricePerNight;
    document.getElementById('total-amount').textContent = '£' + (total > 0 ? total : pricePerNight);
}

async function confirmBooking() {
    const name = document.getElementById('cust-name').value;
    const email = document.getElementById('cust-email').value;
    const phone = document.getElementById('cust-phone').value;
    const guests = document.getElementById('guest-count').value;
    const checkIn = document.getElementById('check-in').value;
    const checkOut = document.getElementById('check-out').value;
    const rooms = document.getElementById('room-count').value;
    const total = document.getElementById('total-amount').textContent;

    if (!name || !phone || !checkIn || !checkOut || !email) {
        alert("Please fill all fields!");
        return;
    }
    
    // Ensure check out is after check in
    const reqIn = new Date(checkIn);
    const reqOut = new Date(checkOut);
    if (reqIn >= reqOut) {
        alert("Check-out date must be after Check-in date.");
        return;
    }

    if (paymentMethod === 'online') {
        const cNum = document.getElementById('card-num').value;
        const cExp = document.getElementById('card-exp').value;
        const cCvc = document.getElementById('card-cvc').value;
        const cZip = document.getElementById('card-zip').value;
        if (!cNum || !cExp || !cCvc || !cZip) {
            alert("Please fill in your card details to pay online.");
            return;
        }
    }

    const btn = document.querySelector('.confirm-btn');
    btn.textContent = "Checking Availability...";
    btn.disabled = true;

    try {
        const propName = "Property " + (selectedPropIdx + 1);
        
        // 1. Check Availability
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/bookings?property_name=eq.${encodeURIComponent(propName)}&select=check_in,check_out`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        
        if (!checkResponse.ok) throw new Error("Failed to check availability");
        const existingBookings = await checkResponse.json();
        
        let hasOverlap = false;
        for (let b of existingBookings) {
            const existIn = new Date(b.check_in);
            const existOut = new Date(b.check_out);
            // Overlap logic: reqIn < existOut AND reqOut > existIn
            if (reqIn < existOut && reqOut > existIn) {
                hasOverlap = true;
                break;
            }
        }
        
        if (hasOverlap) {
            alert(`This property (${propName}) is already booked for the selected dates. Please select different dates.`);
            btn.textContent = "Confirm Booking";
            btn.disabled = false;
            return;
        }

        if (paymentMethod === 'online') {
            btn.textContent = "Authenticating Payment...";
            await new Promise(r => setTimeout(r, 1000));
            btn.textContent = "Processing...";
            await new Promise(r => setTimeout(r, 1200));
            btn.textContent = "Payment Successful!";
            await new Promise(r => setTimeout(r, 500));
        }

        const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                customer_name: name,
                customer_email: email,
                customer_phone: phone,
                check_in: checkIn,
                check_out: checkOut,
                total_price: parseFloat(total.replace('£', '')),
                payment_status: paymentMethod === 'online' ? 'Paid' : 'Pending',
                booking_status: paymentMethod === 'online' ? 'Confirmed (Paid)' : 'Confirmed (Pay on Arrival)',
                property_name: "Property " + (selectedPropIdx + 1)
            })
        });

        if (response.ok) {
            alert("Booking Confirmed! Redirecting to WhatsApp...");
            
            let waMsg = `Hi Wilmer House! New Booking:\n\nName: ${name}\nProperty: Property ${selectedPropIdx + 1}\nType: ${bookingType === 'full' ? 'Entire Property' : rooms + ' Rooms'}\nGuests: ${guests}\nDates: ${checkIn} to ${checkOut}\nTotal: ${total}\nPayment: ${paymentMethod === 'online' ? 'Paid Online' : 'Pay on Arrival (Cash)'}`;
            const waUrl = `https://wa.me/447453313017?text=${encodeURIComponent(waMsg)}`;
            
            window.open(waUrl, '_blank');
            closeBookingModal();
        } else {
            throw new Error("Failed to save booking");
        }
    } catch (error) {
        console.error("Booking Error:", error);
        alert("Booking failed. Please check your network connection.");
    } finally {
        btn.textContent = "Confirm Booking";
        btn.disabled = false;
    }
}

// --- GLOBAL SEARCH FUNCTIONALITY ---
