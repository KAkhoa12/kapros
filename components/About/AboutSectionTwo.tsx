const AboutSectionTwo = () => {
  return (
    <section className="pb-16 md:pb-20 lg:pb-28">
      <div className="container">
        <div className="rounded-sm bg-primary/[3%] px-8 py-10 dark:bg-white/[3%] sm:px-10 md:px-[60px]">
          <h3 className="mb-4 text-2xl font-bold text-black dark:text-white">
            Why This Project
          </h3>
          <p className="mb-4 text-base leading-relaxed text-body-color">
            This website helps users preview AI model behavior directly in the
            browser and speed up feedback loops during development.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-base text-body-color">
            <li>Consistent UI for multiple model demos</li>
            <li>Fast testing from upload to result</li>
            <li>Simple integration with backend inference APIs</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;
