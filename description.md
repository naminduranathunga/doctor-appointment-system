# Doctor's appoinment system

Problem: In Sri Lanka, people have to travel very early to get a doctor's appoinment number, and sometimes have to wait in lines for hours. Even after that some people have to go back without getting a number to appoinment. 

Solution: A SaaS type doctor's appoinment system targetting small dispenceries and medical centers. (Dentals in this case.) 
There are situations the people from rural areas also come, but not knowing about the tool, or no technical knowladge for handle them. For them a slot can be allocated manually.
For that, medical-center can reserve some slots. (e.g. 5 slots) and also re-purpose slots that did not show up or cancelled.

Features:
- A medical center can register.
- medical center can add multiple doctors.
- medical center can set dates, times, number of slots available.
- medical center can set a buffer time for each appoinment.
- medical center can select manual slots, and can be alocated from admin panel.
- patients can register by mobile number, during booking.
- patients can book an appoinment by scanning QR code. abc.com/<medical-center>/booking
- Select the doctor, select the date, select the time, and a number will be allocated, estimated time to presence is given.
- patients can see their appoinments from the account. (OTP login)
- patients can cancel the appoinment.
- patients can see appoinment history.
- medical center can see appoinment history.
- patients get reminders (1 day before, 5 hours before, 1 hour before, 15 minutes before)


Tech Stack:
- Frontend + Backend: NextJS latest
- Database: PostgreSQL - use ORM
- Authentication: email password for medical center, SMS OTP for patients. (We don't have sms gateway for now. Print it to console)
- For reminders - keep an end point available.
- Use API versioning (v1)