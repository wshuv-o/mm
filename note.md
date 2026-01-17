regexes for refactoring

^(?!._(\S+):\s+\{)._ --cleanup
(\S+):\s+._ --parts
((import|require)._?)(\.\./)+ --refactore imports to $1@/
\{['"\s]+\} ---cleanup {" "}

## android build setup

add env ANDROID_HOME (the folder which contains platform tools as well if existing android studio instalation exists)

add env JAVA_HOME (the folder that contains bin folder inside which java executable resides)

left------

google/facebook sign in
onboarding profile setup (basically image picker and name).for now users can set images from profile screen
fix image upload on web
search your whatsapp for word "bug" and solve the reported bugs
create good responsive table component which can collapse
format all dates
add forget password feature

---

roles and access control= admin has control over all the communities and course creation, instructors can control their course cotent only and chat with all the students

admins & instr onboarding=instructor has a new form LP

what should the instructor acces regarding community?
add filtering via hashtags on home LP

add role toggle for the centralized usermgmt table.add scrollable to tables --
add a viewer for masonry items
hande non image typedata in masonry
adjust paginated queries on frontend

community and enrollment should get activated if admin approv not wait for payment

## notifications coverage

Someone commented on a post ---
Someone reacted to my comment ---
Someone replied to my comment ---
Someone reacted to a post ---
new post ---
Mentions
Someone mentioned me in a post ---
Someone mentioned me in a comment ---

✅1.remove share icon from post actions
✅2.make the saved post functionality more ux friendly,more apparent.make it as a filter, maybe like the hashtags one
✅3.need 3 prominent feature directly accessible from the header.A new page is required which will list all the communities in cards like course-list page (context desktop)
✅4.search functionality in DM
✅5.padding issue on community post editor
✅6.fix timestamp format on dm/lobby messages as well as on posts. IST is prefered
7.add ceo society logo where necessary like in auth pages etc.should make a logo uploading field on org setting admin page.but will do just hardcoding for now
✅8.remove google/fb login button from auth pages
✅9.font size issue on auth pages.a bigger size is required.see figma
✅10.misaligned cards on course list page (context mobile)
✅11.the tab buttons on the bottom seems small.check design specifications (context mobile)
✅12.font size issue on the my profile page of dashboard.need to enlarge
✅14.padding issues on inputs
✅15.community banner image
✅16.pinned post feature
17.more expressive place holder on class creation inputs
✅18.after scheduling zoom class nothing happens
✅19.attach zoom webhooks with production url.configure the premium zoom account provided by dev to use on this service
✅20.configure premium bunny account to use with this service.
21.replace forminator with opensource solution
✅22.implement forget password feature
✅23.check all the policies deeply on bakend again before the final deployment.there might be some permission missing
✅24.do roles reflect the current status properly?
25.add firebase notification before the mobile app deployment
✅26.name instaed of username in posts
✅27.add message section devider based on date for both lobby and direct messages.remove date part part from the ts.
✅28.in lobby reduce the user name fsize and make the actual message fs bigger to put more emphasis on the message
✅29.make the post content font size 13/12.seek daksh's feedback on this
✅30.colors in the agreement form needs a check.it has become hidden
✅31.login page still awefully big
✅32.register text is small.there is reference image on whataspp.follow that.applies to 31 as well
✅33.double check the fontsize of community list page once to see if it matches course list page.
✅34.make the send icon bigger for messaging inputs (lobby and dm)
✅35.on community list page th alighnment beetween icon and com name is not right.also the spacing beetween them is too much
✅36.change dm time stamp color to hex ff949e
✅37.the courses which the student don't have any access should be greyed out .talking about the start learning button.but have to discuss instead of greying we should say "enroll now" i think.
✅38.on logout modal why the user needs to double click on logout button?needs fix
✅39.fix the bug reported by enamul on DM page.happens on small screen
✅40.contacts search should only be visible to admins
✅41.fix the bug .don't show messages by default on home page
✅42.fix send button bg on dm and lobby portion
✅43.post ts should only show time portion for today's posts.
✅44.attachment button is almost overflowing on mobile.post sect
❌45.try to align the placeholder text on multiline inputs to center. (NOT POSSIBLE.DROPPED)
✅46.change post lineheight to 20 (only on phone)
✅47.replace username to fullname on notification modal.and move it to a little more right
✅48.make notification bell icon operate like a toggle
✅49.notification only font size should be 13/12
✅50.move home route to top
✅51.change community joined button text to Enter
✅52.bring back collexo conf page to org settings
✅53.CAUTION! a security bug detected,admins should not be able to make an user owner.this is a form of priviledge escalation attack.(note:this is now blocked from the validation layer on backend)
✅54.fix zoom webhook url shown in org settings
✅55.For student remove communites dropdown from drawer.move the edit button to standalone community page
❌56.make the contentrenderer more customizable .it should accept styles as props. (UNNECESSARY.DROPPED)
✅57.the button on the bottom portion of notification modal is too small.hard to read.
✅58.membership and enrollment onboarding card should be properly center aligned.
✅59.add delete buttons for post and comments
✅60.fix margin beetween action buttons and post content on post card.
61.add multiplan feature on the payment pipeline
62.add shortcuts support on message inputs for desktops
✅63.message list should be auto scrolled to bottom.lobby and dm.
❌64.message auto clear functionality not working on send. (COULDN'T REPRODUCE.DROPPED)




