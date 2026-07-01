import NavBubble from "../components/navBubble";

export default function FAQ() {
  return (
    <div className="bg-[#fcefe6] min-h-screen flex flex-col items-center px-6 py-8">


      {/* ABOUT US Section */}
      <SectionBubble title="ABOUT US">

      <img
        src="/images/aboutus.jpg"
        alt="About Us"
        className="w-full max-w-md mx-auto mb-6 rounded-xl shadow-md"
      />


        <p className="font-theseasons text-[#7a5a47] text-sm md:text-base mb-6">
          Thank you for finding us! Our little bakery aims to bring good things to your day!
          Our team consists of the following members:
        </p>

        {/* TEDDY */}
        <h2 className="font-lazydog text-[#5b3c2f] text-lg font-semibold mb-1 text-left">
          TEDDY (TADY)
        </h2>

        <p className="font-theseasons text-[#7a5a47] mb-1 text-left">
          (Certified Treat Officer)
        </p>

        <div className="font-theseasons text-[#7a5a47] mb-6 space-y-1 text-left">
          <p>- Shih-Tzu - Poodle</p>
          <p>- Adopted from Ottawa 8 years ago</p>
          <p>- only likes expensive apples and yogurt</p>
          <p>- “Tady” comes from how our parents spelled it out one time in a text and it stuck</p>
          <p>- likes to go places but doesn’t like being IN the car</p>
        </div>

        {/* ANNA */}
        <h2 className="font-lazydog  text-[#5b3c2f] text-lg font-semibold mb-1 text-right">
          ANNA
        </h2>

        <p className="font-theseasons text-[#7a5a47] mb-1 text-right">
          (Baker, Artist, Co-owner, Tady’s favourite)
        </p>

        <div className="font-theseasons text-[#7a5a47] mb-6 space-y-3 text-right">
          <p>Hi! I’m Anna</p>

          <p>
            I’m a self-taught baker but I do have a Food Science degree (that I didn’t really use)
            so that counts for something!
          </p>

          <p>
            For so many years I made sweet treats as a hobby and now I have created TBC to bring
            all that I have learned to you!
          </p>

          <p>
            After quitting my corporate job and moving from BC, Tady became very attached to me
            and in order to honour this I made him our mascot (I drew the logo with a mouse!)
          </p>

          <p>
            Whether you have found us online, or visited us at one of our market appearances,
            or picked something of ours from the cafe, it means the world to me! Thank you!
          </p>

          <p>
            Oh also I dragged Main into this but nothing is possible without him!!
          </p>
        </div>

        {/* MAIN */}
        <h2 className="font-lazydog  text-[#5b3c2f] text-lg font-semibold mb-1 text-left">
          MAIN
        </h2>

        <p className="font-theseasons text-[#7a5a47] mb-1 text-left">
          (Dishwasher, Logistics, Co-owner, Tady's spare human)
        </p>

        <div className="font-theseasons text-[#7a5a47] space-y-3 text-left">
          <p>Hello I'm Main!</p>

          <p>
            I met Anna over a decade ago and she has slowly but surely made me love sweet treats
            through her persistent baking over the years. I'm her #1 fan and I can't wait for you guys to try her stuff!
          </p>

          <p>
            My focus currently is playing a supporting role for TBC in any way I can. So I'll be
            working to get those treats in front of you asap.
          </p>

          <p>
            Thank you for stopping by in our little corner of the web, hope you get to try some sweets soon!
          </p>
        </div>

      </SectionBubble>


          </div>
  );
}

function SectionBubble({ title, children }) {
  return (
    <div className="w-full max-w-2xl p-6 mb-8 text-center">
      <h2 className="font-petitcochon bg-[#e5cbc7] inline-block px-6 py-2 rounded-full text-lg font-bold text-[#806154] mb-4 shadow-md">
        {title}
      </h2>

      <div className="text-sm md:text-base leading-relaxed">
        {children}
      </div>
    </div>
  );
}
