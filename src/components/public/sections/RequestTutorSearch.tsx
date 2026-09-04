import { MaterialIcon } from "@/components/ui/MaterialIcon";

const selectClasses =
  "bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-lg p-3 focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 outline-none transition-all h-[44px]";

export function RequestTutorSearch() {
  return (
    <section className="w-full px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto">
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-md p-lg md:p-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6 relative z-10">
          Request a Tutor Near You
        </h2>
        {/*
          The full parent tuition request flow (structured location, exact
          address, availability slots, etc.) is a dedicated milestone — see
          docs/07_Tuition_Serve_Implementation_Plan.md M5. This quick-search
          widget forwards the visitor's selections to that flow rather than
          silently doing nothing, as the reference HTML's demo form did.
        */}
        <form
          action="/request-tutor"
          method="get"
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-md relative z-10 items-end"
        >
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="grade">
              Class/Grade
            </label>
            <select id="grade" name="grade" className={selectClasses} defaultValue="">
              <option value="">Select Class</option>
              <option value="primary">Primary (1-5)</option>
              <option value="lower-secondary">Lower Secondary (6-8)</option>
              <option value="secondary">Secondary (9-10)</option>
              <option value="higher-secondary">Higher Secondary (11-12)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="subject">
              Subject
            </label>
            <select id="subject" name="subject" className={selectClasses} defaultValue="">
              <option value="">Select Subject</option>
              <option value="mathematics">Mathematics</option>
              <option value="science">Science</option>
              <option value="english">English</option>
              <option value="computer-science">Computer Science</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="city">
              Location
            </label>
            <select id="city" name="city" className={selectClasses} defaultValue="">
              <option value="">Select City</option>
              <option value="kathmandu">Kathmandu</option>
              <option value="lalitpur">Lalitpur</option>
              <option value="pokhara">Pokhara</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="schedule">
              Schedule
            </label>
            <select id="schedule" name="schedule" className={selectClasses} defaultValue="">
              <option value="">Any Time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
          <div className="lg:col-span-1 md:col-span-4 flex">
            <button
              type="submit"
              className="w-full bg-primary-container text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md hover:bg-opacity-90 transition-all flex justify-center items-center gap-2 h-[44px]"
            >
              <MaterialIcon name="search" />
              Request a Tutor
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
