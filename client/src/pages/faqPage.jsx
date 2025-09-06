import NavBubble from "../components/navBubble";

export default function FAQ() {
  return (
    <div className="bg-[#fcefe6] min-h-screen flex flex-col items-center px-6 py-8">

      {/* ABOUT US Section */}
      <SectionBubble title="ABOUT US">
      <p className="font-lazydog text-[#7a5a47] text-sm md:text-base mb-10">
        Est. 2025 • Bringing you the most delicious cookies and butter tarts in Ajax!
      </p>
      <p className="font-theseasons text-[#5b3c2f]">
      Tady (Legally known as Teddy) is just a very well loved family dog with owners who like baking and is the inspiration for bringing this small business alive!
      </p>
      <br></br>
      <p className="font-theseasons text-[#5b3c2f]">
      We aim to serve you with products that hit just right
      </p>
      </SectionBubble>

      {/* FAQ Section */}
      <SectionBubble title="FAQ">
        <div className="space-y-6 text-left">
          <div>
            <h3 className="font-lazydog font-bold text-[#806154] ">ALLERGY DISCLAIMER:</h3>
            <p className="font-theseasons text-[#5b3c2f]">
            Please be advised that all products made in our home bakery are prepared in a shared kitchen where allergens such as peanuts, tree nuts, dairy, wheat (gluten), eggs, mustard, and sesame seeds may be present. While we take precautions to avoid cross-contact, we cannot guarantee that our products are free from traces of these allergens.
            <br></br>
            If you or anyone consuming our products has a food allergy or sensitivity, please be aware of this risk. For specific allergen concerns, feel free to contact us before ordering.
            <br></br>
            Consume at your own risk if you have severe allergies.
            </p>
          </div>

          <div>
            <h3 className="font-lazydog font-bold text-[#806154]">HOW FAR IN ADVANCE DO I NEED TO ORDER?</h3>
            <p className="font-theseasons text-[#806154]">
              Please provide at least a 18-hour advance notice to fulfill your order.
              If you need something sooner, reach out — we’ll do our best to accommodate you!
            </p>
          </div>

          <div>
            <h3 className="font-lazydog font-bold text-[#806154]">PICKUP?</h3>
            <p className="font-theseasons text-[#806154]">
              Once your order is confirmed after checkout, we’ll provide you with the pickup address in Ajax, ON.
            </p>
          </div>

          <div>
            <h3 className="font-lazydog font-bold text-[#806154]">DELIVERY?</h3>
            <p className="font-theseasons text-[#806154]">
              We currently offer local delivery within Pickering and Ajax for orders over $45.
            </p>
          </div>

          <div>
            <h3 className="font-lazydog font-bold text-[#806154]">TADY?</h3>
            <p className="font-theseasons text-[#806154]">
              Tady (Teddy) is a 7 year old Shih-Tzu - Poodle mix that was adopted from Ottawa.
              <br></br>
              He is our CTO (Certified Treat Officer) and takes his job very seriously
            </p>
          </div>
        </div>
      </SectionBubble>

    </div>
  );
}

function SectionBubble({ title, children }) {
  return (
    <div className="w-full max-w-2xl  p-6 mb-8 text-center">
      <h2 className="font-petitcochon bg-[#e5cbc7] inline-block px-6 py-2 rounded-full text-lg font-bold text-[#806154] mb-4 shadow-md">
        {title}
      </h2>
      <div className="text-sm md:text-base leading-relaxed">{children}</div>
    </div>
  );
}
