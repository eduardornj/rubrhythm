import MainLayout from "@components/MainLayout";

export default function ReviewPage({ params }) {
  const { state, city, slug } = params;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-text mb-4">Leave a Review</h1>
        <p className="text-text">Review form coming soon!</p>
      </div>
    </MainLayout>
  );
}