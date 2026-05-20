# MemoryShots Client Tutorial

Welcome to **MemoryShots**, a QR event photo sharing system for weddings, birthdays, christenings, corporate events, anniversaries, and private celebrations.

Guests scan a QR code, enter their name, and upload photos from the event. You, as the admin, can approve photos, manage the gallery, download images, and display approved photos in TV mode.

## 1. Login To Your Admin Account

1. Open the MemoryShots website.
2. Click **Login**.
3. Enter your admin email and password.
4. Click **Login**.

After logging in, you will be redirected to the **Dashboard**.

## 2. Create An Event

1. From the Dashboard, click **Create event**.
2. Fill in the event details:
   - **Event title**
   - **Event type**
   - **Photo limit per guest**
   - **Cover image URL**, optional
   - **Event date**
   - **Active** status
   - **Guestbook**, optional
   - **Watermark**, optional
3. Click **Create event**.

The system automatically creates a random event link slug for you. You do not need to manually create the event link.

Example event link:

```txt
https://your-site.com/event/baby-dodovs-birthday-a7f31c
```

## 3. Download The QR Poster

After creating an event:

1. Open the event from the Dashboard.
2. Find the QR code panel.
3. Click **Poster PNG**.
4. The system will download a printable QR poster.

You can print this poster and place it at:

- Event entrance
- Guest tables
- Registration table
- Photo booth area
- Stage or screen area

Guests can scan the QR using their phone camera.

## 4. Share The Event Link

On the event page, you can also:

- Click **Copy** to copy the event link.
- Click **Guest link** to open the guest upload page.

You can send the guest link through:

- Messenger
- Viber
- WhatsApp
- Email
- Event group chat
- Invitation message

## 5. Guest Photo Upload Flow

Guests do not need an account.

Guest steps:

1. Scan the QR code.
2. Enter their name or nickname.
3. Tap **Take photo** or **Upload**.
4. Choose a filter, optional.
5. Preview the photo.
6. Tap **Upload**.

Each guest is limited to **16 photos per event**.

When the guest reaches the limit, the upload buttons are disabled.

## 6. Approve Photos

Uploaded photos are not shown publicly right away. They first appear in the admin gallery.

To approve photos:

1. Open the event from the Dashboard.
2. Scroll to the **Photos** section.
3. Review uploaded photos.
4. Click **Approve** to show the photo publicly.
5. Click **Hide** if you do not want the photo visible.
6. Click **Delete** if you want to permanently remove the photo.

Once approved, the photo appears in the public gallery and TV mode.

## 7. View Public Gallery

Guests and admins can view the public gallery at:

```txt
/event/event-slug/gallery
```

Only approved photos are visible in the public gallery.

The gallery includes:

- Live carousel
- Photo grid
- Guest name
- Capture date

## 8. Use TV Mode

TV mode is useful for displaying approved photos on a screen during the event.

To open TV mode:

1. Open the public gallery.
2. Click **TV Carousel**.

TV mode includes:

- Full-screen display
- Automatic photo slideshow
- 3-second slide timer
- Manual next/previous controls
- Queue list with thumbnail, guest name, and date

Direct TV mode link:

```txt
/event/event-slug/gallery?tv=1
```

You can open this link on:

- Laptop connected to TV
- Smart TV browser
- Tablet
- Projector screen

## 9. Download All Photos

To download event photos:

1. Open the event from the Dashboard.
2. Click **ZIP**.
3. The system downloads the photos as a ZIP file.

This is useful after the event when sending all photos to the client or organizer.

## 10. Delete An Event

Only delete an event when you are sure.

To delete:

1. Open the event from the Dashboard.
2. Click **Delete Event**.
3. Confirm the delete prompt.

Deleting an event removes:

- Event details
- Guest records
- Photo records
- Guestbook messages
- Stored photos

## 11. Logout

To logout:

1. Go to the Dashboard.
2. Click **Logout**.
3. Confirm: **Are you sure you want to logout?**

You will be returned to the login page.

## 12. Best Practices During Events

Before the event:

- Create the event early.
- Test the QR code using your phone.
- Print multiple QR posters.
- Place QR posters where guests can easily see them.
- Test TV mode if you will use a screen.

During the event:

- Keep the admin dashboard open.
- Approve good photos regularly.
- Use TV mode to encourage more guest uploads.

After the event:

- Review all photos.
- Hide or delete unwanted photos.
- Download the ZIP file.
- Share the public gallery link if needed.

## 13. Troubleshooting

### Guest cannot open camera

Make sure the guest is using an HTTPS link. Camera access usually does not work properly on non-secure HTTP links.

### Guest cannot upload

Possible reasons:

- The event is inactive.
- The guest already reached the 16-photo limit.
- The file is too large.
- The file type is not supported.

Allowed file types:

```txt
jpg, jpeg, png, webp
```

### Photo does not show in gallery

The photo must be approved by the admin first.

### TV mode does not update

Try refreshing the TV mode page. Also make sure the backend service is running.

### QR code opens the wrong link

Check that your frontend website URL is correctly set before downloading the QR poster.

## 14. Quick Admin Checklist

Before event day:

- Login works
- Event created
- QR poster downloaded
- QR poster tested
- Guest upload tested
- Admin approval tested
- Gallery tested
- TV mode tested

During event:

- Keep dashboard open
- Approve photos
- Monitor uploads
- Display TV mode

After event:

- Review gallery
- Download ZIP
- Send gallery link or files to client
