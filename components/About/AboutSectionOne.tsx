const AboutSectionOne = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap items-center">
          <div className="w-full px-4 lg:w-1/2">
            <div className="mb-12 max-w-[540px] lg:mb-0">
              <h2 className="mb-5 text-3xl font-bold !leading-tight text-black dark:text-white sm:text-4xl md:text-[40px]">
                Build and Explore AI Models in One Place
              </h2>
              <p className="mb-10 text-base !leading-relaxed text-body-color md:text-lg">
                Kapros provides a unified interface for trying computer-vision
                models, comparing outputs, and validating workflows quickly.
              </p>
            </div>
          </div>

          <div className="w-full px-4 lg:w-1/2">
            <div className="text-base leading-relaxed text-body-color">
              <p className="mb-4">
                The platform focuses on practical model demos with a clean
                upload, process, and result loop. It helps teams prototype and
                evaluate ideas without building custom tooling for each model.
              </p>
              <p>
                Use the models page to test image transforms and object
                detection pipelines with consistent UI behavior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionOne;
